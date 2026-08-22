"""
Outcome Recorder & Continual Learning Feedback Loop for DisputeRocket.
Records processor decisions (WON/LOST) and extracts winning tactics via RocketRide learning pipeline.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from models import CustomerProfile, DisputeOutcome, PastDisputeResult
from pipeline_service import RocketRidePipelineService

logger = logging.getLogger("DisputeRocket.OutcomeLearner")


class OutcomeLearner:
    """
    Manages resolution outcome ingestion and machine learning feedback updates.
    """

    def __init__(self, pipeline_service: RocketRidePipelineService):
        self.pipeline_service = pipeline_service
        self.outcomes: Dict[str, DisputeOutcome] = {}
        self.merchant_knowledge_base: List[Dict[str, Any]] = []

    async def record_resolution(
        self,
        dispute_id: str,
        outcome: str,  # "WON" or "LOST"
        amount: float,
        processor_feedback: Optional[str] = None,
        customer_profile: Optional[CustomerProfile] = None,
    ) -> DisputeOutcome:
        """
        Record final dispute resolution, execute RocketRide learning pipeline, and update customer profile.
        """
        outcome_upper = outcome.upper()
        recovered = amount if outcome_upper == "WON" else 0.0

        outcome_payload = {
            "dispute_id": dispute_id,
            "outcome": outcome_upper,
            "amount_disputed": amount,
            "recovered_amount": recovered,
            "processor_feedback": processor_feedback or "Decision rendered by issuing bank.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Run AI Learning Pipeline
        logger.info(f"Executing dispute learning pipeline for dispute {dispute_id}...")
        learning_result = await self.pipeline_service.execute_learning_pipeline(outcome_payload)

        winning_factors = learning_result.get("winning_factors", [])
        learning_insights = learning_result.get("learning_insights", [])

        dispute_outcome = DisputeOutcome(
            dispute_id=dispute_id,
            outcome=outcome_upper,
            recovered_amount=recovered,
            processor_decision_date=datetime.now(timezone.utc),
            processor_feedback=processor_feedback,
            winning_factors=winning_factors,
            learning_insights=learning_insights,
        )

        self.outcomes[dispute_id] = dispute_outcome

        # Update merchant knowledge base with new heuristics
        knowledge_entry = {
            "dispute_id": dispute_id,
            "outcome": outcome_upper,
            "winning_factors": winning_factors,
            "learning_insights": learning_insights,
            "recorded_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        }
        self.merchant_knowledge_base.append(knowledge_entry)

        # Update customer profile history if provided
        if customer_profile:
            past_record = PastDisputeResult(
                dispute_id=dispute_id,
                reason_code=getattr(customer_profile, "last_reason_code", "GENERAL_DISPUTE"),
                dispute_amount=amount,
                outcome=outcome_upper,
                effective_rebuttal_points=winning_factors,
                resolution_date=datetime.now(timezone.utc),
            )
            customer_profile.past_disputes.append(past_record)
            
            # Recalculate customer win rate
            all_disputes = customer_profile.past_disputes
            wins = sum(1 for d in all_disputes if d.outcome == "WON")
            customer_profile.win_rate_history = wins / len(all_disputes) if all_disputes else 1.0

        logger.info(
            f"Outcome recorded for {dispute_id} ({outcome_upper}). "
            f"Extracted {len(winning_factors)} winning factors and {len(learning_insights)} learning heuristics."
        )
        return dispute_outcome
