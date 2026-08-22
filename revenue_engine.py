"""
Revenue & Commercial Monetization Engine for DisputeRocket.
Calculates fee per dispute (paid job) and contingency percentage on recovered funds.
"""

from datetime import datetime, timezone
import logging
import os
from typing import Dict, List
from models import RevenueRecord

logger = logging.getLogger("DisputeRocket.RevenueEngine")


class RevenueEngine:
    """
    Manages commercial billing models for DisputeRocket:
    - Base Job Fee per dispute intake/defense compilation ($25.00)
    - Contingency Success Fee (% of recovered funds upon winning dispute, default 15%)
    """

    def __init__(
        self,
        flat_fee_per_dispute: float = None,
        contingency_fee_percent: float = None,
    ):
        # Load from environment or defaults
        self.flat_fee = (
            flat_fee_per_dispute
            if flat_fee_per_dispute is not None
            else float(os.getenv("DISPUTE_FLAT_FEE", "25.0"))
        )
        self.contingency_percent = (
            contingency_fee_percent
            if contingency_fee_percent is not None
            else float(os.getenv("DISPUTE_RECOVERY_FEE_PERCENT", "15.0"))
        )
        self.ledger: List[RevenueRecord] = []

    def record_dispute_resolution(
        self,
        dispute_id: str,
        amount_disputed: float,
        outcome: str,
        merchant_id: str = "merchant_default",
    ) -> RevenueRecord:
        """
        Compute earnings for a completed dispute resolution job.
        Every dispute is a paid job (flat fee), plus contingency bonus on recovery.
        """
        outcome_upper = outcome.upper()
        recovered_amount = amount_disputed if outcome_upper == "WON" else 0.0

        contingency_fee_charged = (
            (recovered_amount * (self.contingency_percent / 100.0))
            if outcome_upper == "WON"
            else 0.0
        )

        total_revenue = self.flat_fee + contingency_fee_charged

        record = RevenueRecord(
            dispute_id=dispute_id,
            merchant_id=merchant_id,
            amount_disputed=amount_disputed,
            outcome=outcome_upper,
            recovered_amount=recovered_amount,
            flat_fee_charged=self.flat_fee,
            contingency_fee_percent=self.contingency_percent,
            contingency_fee_charged=contingency_fee_charged,
            total_revenue_earned=total_revenue,
            timestamp=datetime.utcnow(),
        )

        self.ledger.append(record)
        logger.info(
            f"Revenue recorded for dispute {dispute_id}: "
            f"${total_revenue:.2f} earned (Flat: ${self.flat_fee:.2f}, "
            f"Contingency {self.contingency_percent}%: ${contingency_fee_charged:.2f}) on ${recovered_amount:.2f} recovered."
        )
        return record

    def get_financial_summary(self) -> Dict:
        """Get aggregate metrics on revenue, win rates, and merchant ROI."""
        total_jobs = len(self.ledger)
        total_disputed = sum(r.amount_disputed for r in self.ledger)
        total_recovered = sum(r.recovered_amount for r in self.ledger)
        total_revenue_earned = sum(r.total_revenue_earned for r in self.ledger)
        won_jobs = sum(1 for r in self.ledger if r.outcome == "WON")

        win_rate = (won_jobs / total_jobs * 100.0) if total_jobs > 0 else 0.0
        merchant_net_savings = total_recovered - total_revenue_earned

        return {
            "total_disputes_processed": total_jobs,
            "disputes_won": won_jobs,
            "win_rate_percent": f"{win_rate:.1f}%",
            "total_disputed_volume": f"${total_disputed:,.2f}",
            "total_recovered_volume": f"${total_recovered:,.2f}",
            "disputerocket_revenue_earned": f"${total_revenue_earned:,.2f}",
            "merchant_net_savings": f"${merchant_net_savings:,.2f}",
            "merchant_roi_ratio": (
                f"{(merchant_net_savings / total_revenue_earned):.1f}x"
                if total_revenue_earned > 0
                else "N/A"
            ),
        }
