"""
Data Aggregator for DisputeRocket.
Correlates dispute alerts, orders, user telemetry, delivery tracking, and customer historical dispute data.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from models import (
    CustomerProfile,
    DeliveryProof,
    DisputeAlert,
    DisputeReasonCode,
    OrderItem,
    OrderRecord,
    PastDisputeResult,
    ProcessorType,
    UserSessionTelemetry,
)


class DataAggregator:
    """
    Central repository and correlation engine for cross-system customer records.
    """

    def __init__(self):
        self.customers: Dict[str, CustomerProfile] = {}
        self.orders: Dict[str, OrderRecord] = {}
        self.telemetry: Dict[str, UserSessionTelemetry] = {}
        self.deliveries: Dict[str, DeliveryProof] = {}
        self.disputes: Dict[str, DisputeAlert] = {}
        self._seed_sample_data()

    def _seed_sample_data(self):
        """Pre-populate realistic mock data for SaaS and E-commerce stores."""
        # 1. SaaS Customer: "Alexander Vance" (CloudFlow SaaS Annual Subscription Dispute)
        cust_saas = CustomerProfile(
            customer_id="cust_saas_9821",
            full_name="Alexander Vance",
            email="alexander.vance@enterpriseflow.io",
            registered_at=datetime(2025, 4, 15, 10, 30),
            lifetime_orders_count=3,
            lifetime_spend_total=1450.00,
            win_rate_history=1.0,
            past_disputes=[
                PastDisputeResult(
                    dispute_id="disp_past_001",
                    reason_code=DisputeReasonCode.SUBSCRIPTION_CANCELED,
                    dispute_amount=450.00,
                    outcome="WON",
                    effective_rebuttal_points=[
                        "Proof of login activity 4 days after renewal date",
                        "Explicit opt-in to non-refundable annual plan at checkout",
                    ],
                    resolution_date=datetime(2025, 10, 20),
                )
            ],
            is_repeat_trusted_customer=True,
        )
        self.customers[cust_saas.customer_id] = cust_saas

        order_saas = OrderRecord(
            order_id="ord_saas_44812",
            customer_id=cust_saas.customer_id,
            amount=450.00,
            currency="USD",
            created_at=datetime(2026, 7, 10, 14, 22),
            items=[
                OrderItem(
                    item_id="prod_saas_pro_annual",
                    product_name="CloudFlow Pro Enterprise - Annual License",
                    quantity=1,
                    unit_price=450.00,
                    is_digital_download=False,
                    download_url_accessed=True,
                )
            ],
            billing_name="Alexander Vance",
            billing_address={
                "line1": "742 Evergreen Terrace",
                "city": "Austin",
                "state": "TX",
                "postal_code": "78701",
                "country": "US",
            },
            customer_email=cust_saas.email,
            customer_phone="+1-512-555-0199",
            ip_address="198.51.100.42",
            card_brand="VISA",
            card_last4="8819",
            avs_match=True,
            cvv_match=True,
            terms_and_conditions_accepted=True,
            cancellation_policy_accepted=True,
            receipt_sent_at=datetime(2026, 7, 10, 14, 23),
        )
        self.orders[order_saas.order_id] = order_saas

        telemetry_saas = UserSessionTelemetry(
            customer_id=cust_saas.customer_id,
            session_id="sess_auth_991823",
            ip_address="198.51.100.42",
            ip_country="United States",
            ip_city="Austin, TX",
            isp="AT&T Internet Services",
            device_fingerprint="MacBookPro18,1_macOS_14.5_Chrome_126.0",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            login_timestamps=[
                datetime(2026, 7, 10, 14, 20),
                datetime(2026, 7, 10, 14, 25),
                datetime(2026, 7, 18, 9, 12),
                datetime(2026, 7, 25, 16, 45),
                datetime(2026, 8, 5, 11, 00),
            ],
            two_factor_auth_verified=True,
            features_used=[
                "Workflow_Automation_Export",
                "Team_Member_Invite_3_Seats",
                "API_Key_Generated",
                "Cloud_Storage_Sync_50GB",
            ],
            api_calls_count=4318,
            saas_active_hours_total=38.4,
            last_active_timestamp=datetime(2026, 8, 14, 18, 30),
        )
        self.telemetry[cust_saas.customer_id] = telemetry_saas

        delivery_saas = DeliveryProof(
            order_id=order_saas.order_id,
            carrier="DigitalProvisioningService",
            delivery_status="DELIVERED",
            delivered_at=datetime(2026, 7, 10, 14, 22, 5),
            digital_provisioning_log="Instant license activation key [KEY-8821-VANCE] bound to account ID acc_9821. 2FA phone confirmed via SMS +1-512-555-0199.",
        )
        self.deliveries[order_saas.order_id] = delivery_saas

        # 2. E-commerce Customer: "Elena Rostova" (Luxury Electronics Physical Delivery Dispute)
        cust_ecom = CustomerProfile(
            customer_id="cust_ecom_5512",
            full_name="Elena Rostova",
            email="elena.rostova@designstudio.co",
            registered_at=datetime(2025, 1, 10, 9, 0),
            lifetime_orders_count=5,
            lifetime_spend_total=3200.00,
            win_rate_history=1.0,
            past_disputes=[],
            is_repeat_trusted_customer=True,
        )
        self.customers[cust_ecom.customer_id] = cust_ecom

        order_ecom = OrderRecord(
            order_id="ord_ecom_99214",
            customer_id=cust_ecom.customer_id,
            amount=899.00,
            currency="USD",
            created_at=datetime(2026, 8, 1, 11, 15),
            items=[
                OrderItem(
                    item_id="prod_audio_pro_headphones",
                    product_name="AcousticPro Studio Reference Headphones (Wireless/ANC)",
                    quantity=1,
                    unit_price=899.00,
                    is_digital_download=False,
                )
            ],
            billing_name="Elena Rostova",
            billing_address={
                "line1": "350 5th Avenue, Suite 4100",
                "city": "New York",
                "state": "NY",
                "postal_code": "10118",
                "country": "US",
            },
            shipping_address={
                "line1": "350 5th Avenue, Suite 4100",
                "city": "New York",
                "state": "NY",
                "postal_code": "10118",
                "country": "US",
            },
            customer_email=cust_ecom.email,
            customer_phone="+1-212-555-0144",
            ip_address="192.0.2.77",
            card_brand="MASTERCARD",
            card_last4="1092",
            avs_match=True,
            cvv_match=True,
            terms_and_conditions_accepted=True,
            cancellation_policy_accepted=True,
            receipt_sent_at=datetime(2026, 8, 1, 11, 16),
        )
        self.orders[order_ecom.order_id] = order_ecom

        delivery_ecom = DeliveryProof(
            order_id=order_ecom.order_id,
            carrier="FedEx Express",
            tracking_number="982144810291",
            shipped_at=datetime(2026, 8, 2, 8, 30),
            delivered_at=datetime(2026, 8, 4, 13, 42),
            delivery_status="DELIVERED",
            signed_by="E. ROSTOVA",
            delivery_gps_lat=40.7484,
            delivery_gps_lng=-73.9857,
            delivery_photo_url="https://secure-carrier-proof.com/photos/fedex_982144810291.jpg",
        )
        self.deliveries[order_ecom.order_id] = delivery_ecom

    def register_dispute_alert(self, alert: DisputeAlert) -> DisputeAlert:
        """Register a new incoming dispute alert from Stripe/Shopify/PayPal webhook."""
        self.disputes[alert.dispute_id] = alert
        return alert

    def gather_customer_dossier(self, dispute_id: str) -> Dict:
        """
        Build a comprehensive, cross-linked per-customer dispute dossier.
        """
        dispute = self.disputes.get(dispute_id)
        if not dispute:
            raise ValueError(f"Dispute {dispute_id} not found in aggregator.")

        customer = self.customers.get(dispute.customer_id)
        order = self.orders.get(dispute.order_id)
        telemetry = self.telemetry.get(dispute.customer_id)
        delivery = self.deliveries.get(dispute.order_id)

        dossier = {
            "dispute": dispute.model_dump(mode="json"),
            "customer": customer.model_dump(mode="json") if customer else None,
            "order": order.model_dump(mode="json") if order else None,
            "session_telemetry": telemetry.model_dump(mode="json") if telemetry else None,
            "delivery_proof": delivery.model_dump(mode="json") if delivery else None,
            "past_wins_insights": [
                p.effective_rebuttal_points
                for p in (customer.past_disputes if customer else [])
                if p.outcome == "WON"
            ],
            "correlation_summary": {
                "billing_and_ip_matched": True if (order and telemetry and order.ip_address == telemetry.ip_address) else False,
                "avs_cvv_verified": True if (order and order.avs_match and order.cvv_match) else False,
                "proof_of_receipt_available": True if (delivery and delivery.delivery_status == "DELIVERED") else False,
                "digital_activity_logged": True if (telemetry and len(telemetry.features_used) > 0) else False,
            }
        }
        return dossier
