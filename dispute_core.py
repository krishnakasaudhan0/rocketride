"""
DisputeRocket Core Orchestrator.
Coordinates the entire autonomous payment dispute defense lifecycle:
1. Multi-System Ingestion & Correlation (Alerts, Orders, Sessions, Delivery, Customer History)
2. AI-Powered Triage & Strategy Assessment via RocketRide Pipeline
3. Comprehensive Evidence Compilation & Processor Rebuttal Generation with Gemini
4. Mandatory Human-in-the-Loop Review Gate & Deadline SLA Monitoring
5. Processor Submission Automation
6. Outcome Ingestion & Machine Learning Feedback Loop
7. Real-Time Revenue & Recovery Fee Monetization Tracking
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional

from data_aggregator import DataAggregator
from models import (
    CustomerProfile,
    DisputeAlert,
    DisputeOutcome,
    DisputeReasonCode,
    DisputeStatus,
    EvidenceExhibit,
    EvidencePackage,
    ProcessorType,
    RevenueRecord,
)
from outcome_learner import OutcomeLearner
from pipeline_service import RocketRidePipelineService
from revenue_engine import RevenueEngine
from review_manager import ReviewManager

logger = logging.getLogger("DisputeRocket.Core")


class DisputeRocketCore:
    """
    Main orchestrator for DisputeRocket.
    """

    def __init__(self, fallback_to_local_sim: bool = True):
        self.aggregator = DataAggregator()
        self.pipeline_service = RocketRidePipelineService(fallback_to_local_sim=fallback_to_local_sim)
        self.review_manager = ReviewManager()
        self.outcome_learner = OutcomeLearner(self.pipeline_service)
        self.revenue_engine = RevenueEngine()

    async def start(self):
        """Start RocketRide client session."""
        await self.pipeline_service.initialize()
        logger.info("DisputeRocket Core engine initialized.")

    async def stop(self):
        """Shutdown client session."""
        await self.pipeline_service.shutdown()
        logger.info("DisputeRocket Core engine stopped.")

    async def process_new_dispute_alert(self, alert: DisputeAlert) -> Dict[str, Any]:
        """
        Step 1 & 2 & 3:
        - Register dispute alert
        - Gather cross-system customer records
        - Execute AI Triage Pipeline (dispute_triage.pipe)
        - Execute Full Defense Compilation Pipeline (dispute_defense.pipe) with Gemini
        - Place completed package into Human Review Queue
        """
        logger.info(f"===> Ingesting new dispute alert {alert.dispute_id} ({alert.amount} {alert.currency}) for order {alert.order_id}")
        self.aggregator.register_dispute_alert(alert)

        # 1. Multi-System Correlation
        dossier = self.aggregator.gather_customer_dossier(alert.dispute_id)
        alert.status = DisputeStatus.EVIDENCE_GATHERED

        # 2. AI Triage & Strategy Gap Detection
        logger.info("Running AI Triage & Gap Analysis Pipeline...")
        triage_result = await self.pipeline_service.execute_triage_pipeline(dossier)

        # 3. AI Evidence Compilation & Rebuttal Generation
        logger.info("Running Full AI Dispute Defense Evidence Compilation Pipeline with Gemini...")
        defense_result = await self.pipeline_service.execute_defense_compilation_pipeline(
            dossier, triage_result
        )
        alert.status = DisputeStatus.AI_EVIDENCE_COMPILED

        # Build Structured Evidence Package
        exhibits = [
            EvidenceExhibit(
                title=ex.get("title", "Evidence Exhibit"),
                category=ex.get("category", "GENERAL"),
                summary=ex.get("summary", ""),
            )
            for ex in defense_result.get("exhibits", [])
        ]

        evidence_pkg = EvidencePackage(
            dispute_id=alert.dispute_id,
            processor=alert.processor,
            reason_code=alert.reason_code,
            disputed_amount=alert.amount,
            currency=alert.currency,
            executive_summary=defense_result.get("executive_summary", "Contestation summary"),
            chronological_timeline=defense_result.get("chronological_timeline", []),
            key_counter_arguments=defense_result.get("key_counter_arguments", []),
            exhibits=exhibits,
            rebuttal_letter_text=defense_result.get("rebuttal_letter_text", ""),
            estimated_win_probability=defense_result.get("estimated_win_probability", 0.85),
            risk_factors=defense_result.get("risk_factors", []),
        )

        # 4. Mandatory Human Review Queue
        self.review_manager.queue_for_review(evidence_pkg, alert)

        return {
            "dispute_id": alert.dispute_id,
            "status": alert.status.value,
            "triage_summary": triage_result,
            "evidence_package": evidence_pkg.model_dump(mode="json"),
            "review_required": True,
            "evidence_due_date": alert.evidence_due_date.strftime("%Y-%m-%d %H:%M UTC"),
        }

    def human_review_and_approve(
        self,
        dispute_id: str,
        reviewer_name: str,
        rebuttal_edits: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> EvidencePackage:
        """
        Step 4: Human Reviewer checks before submission.
        """
        pkg = self.review_manager.approve_and_sign_off(
            dispute_id=dispute_id,
            reviewer_name=reviewer_name,
            rebuttal_edits=rebuttal_edits,
            review_notes=notes,
        )
        
        dispute = self.aggregator.disputes.get(dispute_id)
        if dispute:
            dispute.status = DisputeStatus.HUMAN_APPROVED

        return pkg

    async def submit_defense_to_processor(self, dispute_id: str) -> Dict[str, Any]:
        """
        Step 5: Submits the human-verified evidence package to the payment processor (Stripe, PayPal, etc.).
        """
        dispute = self.aggregator.disputes.get(dispute_id)
        if not dispute:
            raise ValueError(f"Dispute {dispute_id} not found.")

        pkg = self.review_manager.evidence_packages.get(dispute_id)
        if not pkg or not pkg.is_approved_for_submission:
            raise ValueError(
                f"Dispute {dispute_id} cannot be submitted: Mandatory human check has not been completed!"
            )

        # Simulated Secure Transmission to Payment Gateway (Stripe/PayPal/Shopify API)
        dispute.status = DisputeStatus.SUBMITTED_TO_PROCESSOR
        logger.info(
            f"Successfully transmitted evidence package for dispute {dispute_id} to {dispute.processor.value} gateway before deadline."
        )

        return {
            "dispute_id": dispute_id,
            "status": dispute.status.value,
            "submitted_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "processor": dispute.processor.value,
            "signed_off_by": pkg.reviewed_by,
            "submission_receipt_token": f"sub_token_rr_{dispute_id}_ack991",
        }

    async def record_dispute_outcome_and_learn(
        self,
        dispute_id: str,
        outcome: str,  # "WON" or "LOST"
        processor_feedback: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Step 6 & 7:
        - Record outcome from payment processor
        - Execute learning pipeline to distill winning factors
        - Update customer profile history
        - Compute revenue earned (% recovered + flat fee)
        """
        dispute = self.aggregator.disputes.get(dispute_id)
        if not dispute:
            raise ValueError(f"Dispute {dispute_id} not found.")

        outcome_upper = outcome.upper()
        dispute.status = (
            DisputeStatus.RESOLVED_WON
            if outcome_upper == "WON"
            else DisputeStatus.RESOLVED_LOST
        )

        customer = self.aggregator.customers.get(dispute.customer_id)

        # 1. AI Learning Pipeline & Knowledge Update
        dispute_outcome = await self.outcome_learner.record_resolution(
            dispute_id=dispute_id,
            outcome=outcome_upper,
            amount=dispute.amount,
            processor_feedback=processor_feedback,
            customer_profile=customer,
        )

        # 2. Commercial Revenue Engine Billing
        revenue_record = self.revenue_engine.record_dispute_resolution(
            dispute_id=dispute_id,
            amount_disputed=dispute.amount,
            outcome=outcome_upper,
        )

        return {
            "dispute_id": dispute_id,
            "outcome": outcome_upper,
            "status": dispute.status.value,
            "recovered_amount": dispute_outcome.recovered_amount,
            "winning_factors": dispute_outcome.winning_factors,
            "learning_insights": dispute_outcome.learning_insights,
            "revenue_billing": revenue_record.model_dump(mode="json"),
            "financial_summary": self.revenue_engine.get_financial_summary(),
        }
