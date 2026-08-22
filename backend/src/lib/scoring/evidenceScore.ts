export interface TelemetryScoreInput {
  avsMatch?: boolean | null;
  cvvMatch?: boolean | null;
  twoFactorUsed?: boolean | null;
  usageHours?: number | null;
}

/**
 * Deterministic evidence scoring function (NOT an LLM call).
 * Computes an auditable pre-score between 0-100 based on verified payment and usage signals.
 */
export function computeEvidenceScore(dispute: any, telemetry: TelemetryScoreInput): number {
  let score = 0;

  // AVS Address Match (+25)
  if (telemetry.avsMatch) {
    score += 25;
  }

  // CVV Security Check (+25)
  if (telemetry.cvvMatch) {
    score += 25;
  }

  // Verified 2-Factor Authentication (+20)
  if (telemetry.twoFactorUsed) {
    score += 20;
  }

  // Active usage telemetry > 10 hours (+20)
  if ((telemetry.usageHours || 0) > 10) {
    score += 20;
  }

  // Heavy persistent usage > 30 hours (+10)
  if ((telemetry.usageHours || 0) > 30) {
    score += 10;
  }

  return Math.min(score, 100);
}
