"""
Domain models for DisputeRocket: Autonomous Payment Dispute Defense & Evidence Compiler.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DisputeReasonCode(str, Enum):
    # Fraud / Card Absent
    FRAUD_CARD_ABSENT = "10.4_FRAUD_CARD_ABSENT"
    FRAUD_UNRECOGNIZED = "10.1_FRAUD_EMV_KEYED"
    
    # Merchandise / Services
    PRODUCT_NOT_RECEIVED = "13.1_MERCHANDISE_NOT_RECEIVED"
    NOT_AS_DESCRIBED = "13.3_NOT_AS_DESCRIBED"
    DEFECTIVE_DAMAGED = "13.2_COUNTERFEIT_DEFECTIVE"
    
    # Subscriptions / Billing
    SUBSCRIPTION_CANCELED = "13.7_CANCELLED_RECURRING_BILLING"
    CREDIT_NOT_PROCESSED = "13.6_CREDIT_NOT_PROCESSED"
    DUPLICATE_CHARGE = "12.6_DUPLICATE_PROCESSING"
    GENERAL = "GENERAL_DISPUTE"


class ProcessorType(str, Enum):
    STRIPE = "STRIPE"
    SHOPIFY = "SHOPIFY"
    PAYPAL = "PAYPAL"
    ADYEN = "ADYEN"
    BRAINTREE = "BRAINTREE"
    AUTHORIZE_NET = "AUTHORIZE_NET"


class DisputeStatus(str, Enum):
    ALERT_RECEIVED = "ALERT_RECEIVED"
    EVIDENCE_GATHERED = "EVIDENCE_GATHERED"
    AI_EVIDENCE_COMPILED = "AI_EVIDENCE_COMPILED"
    PENDING_HUMAN_REVIEW = "PENDING_HUMAN_REVIEW"
    HUMAN_APPROVED = "HUMAN_APPROVED"
    HUMAN_REVISED = "HUMAN_REVISED"
    SUBMITTED_TO_PROCESSOR = "SUBMITTED_TO_PROCESSOR"
    RESOLVED_WON = "RESOLVED_WON"
    RESOLVED_LOST = "RESOLVED_LOST"


class OrderItem(BaseModel):
    item_id: str
    product_name: str
    quantity: int = 1
    unit_price: float
    is_digital_download: bool = False
    download_url_accessed: Optional[bool] = None


class OrderRecord(BaseModel):
    order_id: str
    customer_id: str
    amount: float
    currency: str = "USD"
    created_at: datetime
    items: List[OrderItem]
    billing_name: str
    billing_address: Dict[str, str]
    shipping_address: Optional[Dict[str, str]] = None
    customer_email: str
    customer_phone: Optional[str] = None
    ip_address: str
    card_brand: str = "VISA"
    card_last4: str = "4242"
    avs_match: bool = True  # Address Verification System
    cvv_match: bool = True  # Card Verification Value
    terms_and_conditions_accepted: bool = True
    cancellation_policy_accepted: bool = True
    receipt_sent_at: Optional[datetime] = None


class UserSessionTelemetry(BaseModel):
    customer_id: str
    session_id: str
    ip_address: str
    ip_country: str
    ip_city: str
    isp: str
    device_fingerprint: str
    user_agent: str
    login_timestamps: List[datetime]
    two_factor_auth_verified: bool = True
    features_used: List[str] = Field(default_factory=list)
    api_calls_count: int = 0
    saas_active_hours_total: float = 0.0
    last_active_timestamp: Optional[datetime] = None


class DeliveryProof(BaseModel):
    order_id: str
    carrier: str  # e.g., FedEx, UPS, DHL, DigitalAccess
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    delivery_status: str = "DELIVERED"
    signed_by: Optional[str] = None
    delivery_gps_lat: Optional[float] = None
    delivery_gps_lng: Optional[float] = None
    delivery_photo_url: Optional[str] = None
    digital_provisioning_log: Optional[str] = None


class PastDisputeResult(BaseModel):
    dispute_id: str
    reason_code: DisputeReasonCode
    dispute_amount: float
    outcome: str  # "WON" or "LOST"
    effective_rebuttal_points: List[str] = Field(default_factory=list)
    resolution_date: datetime


class CustomerProfile(BaseModel):
    customer_id: str
    full_name: str
    email: str
    registered_at: datetime
    lifetime_orders_count: int = 1
    lifetime_spend_total: float = 0.0
    past_disputes: List[PastDisputeResult] = Field(default_factory=list)
    win_rate_history: float = 1.0  # 1.0 = 100% win rate in past
    is_repeat_trusted_customer: bool = True


class DisputeAlert(BaseModel):
    dispute_id: str
    transaction_id: str
    order_id: str
    customer_id: str
    processor: ProcessorType
    amount: float
    currency: str = "USD"
    reason_code: DisputeReasonCode
    processor_reason_description: str
    disputed_at: datetime
    evidence_due_date: datetime
    status: DisputeStatus = DisputeStatus.ALERT_RECEIVED


class EvidenceExhibit(BaseModel):
    title: str
    category: str  # e.g., "CUSTOMER_COMMUNICATION", "PROOF_OF_DELIVERY", "DEVICE_SESSION_LOGS", "TERMS_ACCEPTANCE"
    summary: str
    raw_proof_data: Dict[str, Any] = Field(default_factory=dict)


class EvidencePackage(BaseModel):
    dispute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processor: ProcessorType
    reason_code: DisputeReasonCode
    disputed_amount: float
    currency: str = "USD"
    
    # Core Defense Outputs
    executive_summary: str
    chronological_timeline: List[str] = Field(default_factory=list)
    key_counter_arguments: List[str] = Field(default_factory=list)
    exhibits: List[EvidenceExhibit] = Field(default_factory=list)
    rebuttal_letter_text: str
    estimated_win_probability: float = 0.85
    risk_factors: List[str] = Field(default_factory=list)
    
    # Human-in-the-Loop Review
    human_reviewed: bool = False
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    rebuttal_edits: Optional[str] = None
    is_approved_for_submission: bool = False


class DisputeOutcome(BaseModel):
    dispute_id: str
    outcome: str  # "WON" or "LOST"
    recovered_amount: float
    fee_incurred: float = 0.0
    processor_decision_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processor_feedback: Optional[str] = None
    winning_factors: List[str] = Field(default_factory=list)
    learning_insights: List[str] = Field(default_factory=list)


class RevenueRecord(BaseModel):
    dispute_id: str
    merchant_id: str = "merchant_default"
    amount_disputed: float
    outcome: str
    recovered_amount: float
    flat_fee_charged: float
    contingency_fee_percent: float
    contingency_fee_charged: float
    total_revenue_earned: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
