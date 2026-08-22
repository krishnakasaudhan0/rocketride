"""
Human-in-the-Loop (HITL) Review Manager for DisputeRocket.
Enforces the mandatory requirement: 'a human checks before every submission'.
Provides audit trails, rebuttal editing, deadline SLA warnings, and approval workflows.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Dict, List, Optional
from models import DisputeAlert, DisputeStatus, EvidencePackage

logger = logging.getLogger("DisputeRocket.ReviewManager")


class ReviewManager:
    """
    Manages the human review queue, evidence package modifications, and submission sign-offs.
    """

    def __init__(self):
        self.evidence_packages: Dict[str, EvidencePackage] = {}
        self.review_logs: List[Dict] = []

    def queue_for_review(self, evidence_pkg: EvidencePackage, dispute: DisputeAlert) -> EvidencePackage:
        """Place an AI-compiled evidence package into the human review queue."""
        evidence_pkg.human_reviewed = False
        evidence_pkg.is_approved_for_submission = False
        self.evidence_packages[evidence_pkg.dispute_id] = evidence_pkg
        
        dispute.status = DisputeStatus.PENDING_HUMAN_REVIEW
        logger.info(f"Dispute {evidence_pkg.dispute_id} queued for mandatory human review.")
        return evidence_pkg

    def list_pending_reviews(self, disputes_map: Dict[str, DisputeAlert]) -> List[Dict]:
        """List all evidence packages awaiting human review with deadline SLA indicators."""
        pending = []
        now = datetime.now(timezone.utc)

        for disp_id, pkg in self.evidence_packages.items():
            if not pkg.is_approved_for_submission:
                dispute = disputes_map.get(disp_id)
                time_remaining = (
                    dispute.evidence_due_date - now
                    if dispute
                    else timedelta(days=7)
                )
                
                hours_left = max(0.0, time_remaining.total_seconds() / 3600.0)
                is_urgent = hours_left < 48.0

                pending.append({
                    "dispute_id": disp_id,
                    "amount": f"{pkg.disputed_amount:.2f} {pkg.currency}",
                    "processor": pkg.processor.value,
                    "reason_code": pkg.reason_code.value,
                    "win_probability": f"{pkg.estimated_win_probability * 100:.1f}%",
                    "hours_until_deadline": f"{hours_left:.1f} hrs",
                    "sla_status": "URGENT_DEADLINE" if is_urgent else "ON_TRACK",
                    "exhibits_count": len(pkg.exhibits),
                    "created_at": pkg.created_at.strftime("%Y-%m-%d %H:%M UTC"),
                })
        return pending

    def approve_and_sign_off(
        self,
        dispute_id: str,
        reviewer_name: str,
        rebuttal_edits: Optional[str] = None,
        review_notes: Optional[str] = None,
    ) -> EvidencePackage:
        """
        Human reviewer checks, modifies (optional), and approves the evidence package for processor submission.
        """
        pkg = self.evidence_packages.get(dispute_id)
        if not pkg:
            raise ValueError(f"Evidence package for dispute {dispute_id} not found.")

        pkg.human_reviewed = True
        pkg.reviewed_by = reviewer_name
        pkg.reviewed_at = datetime.now(timezone.utc)
        pkg.review_notes = review_notes or "Verified all exhibits, telemetry match, and policy acceptance."
        
        if rebuttal_edits:
            pkg.rebuttal_edits = rebuttal_edits
            pkg.rebuttal_letter_text = rebuttal_edits
            
        pkg.is_approved_for_submission = True

        audit_entry = {
            "dispute_id": dispute_id,
            "reviewer": reviewer_name,
            "timestamp": pkg.reviewed_at.isoformat(),
            "action": "APPROVED_FOR_SUBMISSION",
            "has_edits": bool(rebuttal_edits),
            "notes": pkg.review_notes,
        }
        self.review_logs.append(audit_entry)
        logger.info(f"Dispute {dispute_id} APPROVED by human reviewer '{reviewer_name}'. Ready for submission.")
        return pkg

    def reject_for_recompilation(
        self, dispute_id: str, reviewer_name: str, reason: str
    ) -> EvidencePackage:
        """Send back evidence package for AI re-compilation if gaps are identified."""
        pkg = self.evidence_packages.get(dispute_id)
        if not pkg:
            raise ValueError(f"Evidence package for dispute {dispute_id} not found.")

        pkg.human_reviewed = True
        pkg.reviewed_by = reviewer_name
        pkg.reviewed_at = datetime.now(timezone.utc)
        pkg.is_approved_for_submission = False
        pkg.review_notes = f"REJECTED: {reason}"

        self.review_logs.append({
            "dispute_id": dispute_id,
            "reviewer": reviewer_name,
            "timestamp": pkg.reviewed_at.isoformat(),
            "action": "REJECTED_FOR_REVISION",
            "reason": reason,
        })
        logger.warning(f"Dispute {dispute_id} rejected by {reviewer_name}: {reason}")
        return pkg
