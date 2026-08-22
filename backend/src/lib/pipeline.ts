import { PrismaClient } from '@prisma/client';
import { UnsavedDispute } from './normalizers/stripe';
import { fetchMockTelemetry } from './enrichment/telemetry';
import { computeEvidenceScore } from './scoring/evidenceScore';
import { generateRepresentmentLetter } from './llm/gemini';

export const prisma = new PrismaClient();

/**
 * Executes the complete ingestion pipeline:
 * Normalized Dispute -> Telemetry Enrichment -> Evidence Scoring -> Score-Gated LLM Draft
 */
export async function executeDisputePipeline(
  unsavedDispute: UnsavedDispute,
  rawEventId?: string
) {
  console.log(`[Pipeline] Ingesting dispute ${unsavedDispute.externalDisputeId}...`);

  // Stage 1 & 3: Save normalized dispute with status "INGESTED"
  const dispute = await prisma.dispute.upsert({
    where: { externalDisputeId: unsavedDispute.externalDisputeId },
    create: {
      userId: unsavedDispute.userId,
      processor: unsavedDispute.processor,
      externalDisputeId: unsavedDispute.externalDisputeId,
      chargeId: unsavedDispute.chargeId,
      amountCents: unsavedDispute.amountCents,
      currency: unsavedDispute.currency,
      reasonRaw: unsavedDispute.reasonRaw,
      reasonCanonical: unsavedDispute.reasonCanonical,
      customerName: unsavedDispute.customerName,
      customerEmail: unsavedDispute.customerEmail,
      cardLast4: unsavedDispute.cardLast4,
      businessType: unsavedDispute.businessType,
      evidenceDueBy: unsavedDispute.evidenceDueBy,
      status: 'INGESTED',
    },
    update: {
      ...(unsavedDispute.userId ? { userId: unsavedDispute.userId } : {}),
      amountCents: unsavedDispute.amountCents,
      reasonRaw: unsavedDispute.reasonRaw,
      reasonCanonical: unsavedDispute.reasonCanonical,
      customerName: unsavedDispute.customerName,
      customerEmail: unsavedDispute.customerEmail,
    },
  });

  // Stage 4: Multi-Source Telemetry Enrichment
  console.log(`[Pipeline] Enriching telemetry for ${dispute.customerEmail}...`);
  const telemetryData = fetchMockTelemetry(dispute.customerEmail);

  const telemetrySignal = await prisma.telemetrySignal.create({
    data: {
      disputeId: dispute.id,
      source: telemetryData.source,
      usageHours: telemetryData.usageHours,
      twoFactorUsed: telemetryData.twoFactorUsed,
      avsMatch: telemetryData.avsMatch,
      cvvMatch: telemetryData.cvvMatch,
      sessionCount: telemetryData.sessionCount,
    },
  });

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: { status: 'ENRICHED' },
  });

  // Stage 5: Deterministic Evidence Strength Scoring
  console.log(`[Pipeline] Computing evidence score...`);
  const evidenceScore = computeEvidenceScore(dispute, telemetryData);

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: {
      evidenceScore,
      status: 'SCORED',
    },
  });

  // Stage 6: Gate LLM call on score threshold
  let status = 'SCORED';
  let rebuttalDraft: string | null = null;

  if (evidenceScore >= 50) {
    console.log(`[Pipeline] Score ${evidenceScore} >= 50. Auto-drafting representment letter via Gemini...`);
    rebuttalDraft = await generateRepresentmentLetter({
      dispute,
      telemetry: telemetryData,
      evidenceScore,
    });
    status = 'DRAFTED';
  } else {
    console.log(`[Pipeline] Score ${evidenceScore} < 50. Flagging for Human Review (NEEDS_REVIEW)...`);
    status = 'NEEDS_REVIEW';
  }

  const updatedDispute = await prisma.dispute.update({
    where: { id: dispute.id },
    data: {
      status,
      rebuttalDraft,
    },
    include: {
      telemetrySignals: true,
    },
  });

  // Mark raw webhook event processed if linked
  if (rawEventId) {
    await prisma.rawWebhookEvent.update({
      where: { id: rawEventId },
      data: { processed: true },
    }).catch(() => null);
  }

  console.log(`[Pipeline] Dispute ${dispute.externalDisputeId} pipeline complete: Status = ${status}, Score = ${evidenceScore}/100.`);
  return updatedDispute;
}
