export interface DisputeScenario {
  id: string;
  title: string;
  businessType: 'SaaS' | 'E-Commerce';
  disputeId: string;
  transactionId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  processor: 'STRIPE' | 'SHOPIFY' | 'PAYPAL';
  amount: number;
  currency: string;
  reasonCode: string;
  reasonDescription: string;
  deadlineDays: number;
  hoursRemaining: number;
  order: {
    productName: string;
    orderDate: string;
    cardLast4: string;
    cardBrand: string;
    avsMatch: boolean;
    cvvMatch: boolean;
    ipAddress: string;
    billingAddress: string;
    termsAccepted: boolean;
  };
  telemetry?: {
    activeHours: number;
    loginCount: number;
    twoFactorVerified: boolean;
    apiCallsCount: number;
    lastActiveDate: string;
    deviceFingerprint: string;
    featuresUsed: string[];
  };
  delivery?: {
    carrier: string;
    trackingNumber: string;
    shippedDate: string;
    deliveredDate: string;
    signedBy: string;
    gpsCoordinates: string;
    status: string;
  };
  customerHistory: {
    lifetimeOrders: number;
    lifetimeSpend: number;
    pastDisputesWon: number;
    pastDisputesLost: number;
    trustScore: number;
  };
  aiAnalysis: {
    winProbability: number;
    strategy: string;
    evidenceStrengths: string[];
    exhibits: {
      number: string;
      title: string;
      category: string;
      summary: string;
    }[];
    rebuttalLetter: string;
  };
}

export const PRESET_SCENARIOS: DisputeScenario[] = [
  {
    id: 'saas-annual-fraud',
    title: 'SaaS Platform — $450 Annual Pro Subscription',
    businessType: 'SaaS',
    disputeId: 'dp_saas_2026_091',
    transactionId: 'txn_saas_882190',
    orderId: 'ord_saas_44812',
    customerId: 'cust_alex_vance',
    customerName: 'Alexander Vance',
    customerEmail: 'alex.vance@vancemedia.io',
    processor: 'STRIPE',
    amount: 450.00,
    currency: 'USD',
    reasonCode: '10.4_FRAUD_CARD_ABSENT',
    reasonDescription: 'Cardholder claims charge was unrecognized and fraudulent.',
    deadlineDays: 6,
    hoursRemaining: 138,
    order: {
      productName: 'RocketCloud Pro Developer Annual Plan',
      orderDate: '2026-07-10 14:22 UTC',
      cardLast4: '8819',
      cardBrand: 'VISA',
      avsMatch: true,
      cvvMatch: true,
      ipAddress: '198.51.100.42 (Austin, TX)',
      billingAddress: '404 West 2nd St, Austin, TX 78701',
      termsAccepted: true,
    },
    telemetry: {
      activeHours: 38.4,
      loginCount: 5,
      twoFactorVerified: true,
      apiCallsCount: 4318,
      lastActiveDate: '2026-08-18 19:40 UTC',
      deviceFingerprint: 'macOS_Chrome_M3_ARM64_Verified',
      featuresUsed: ['Pipeline_Deployment', 'Telemetry_Stream', 'Webhook_Engine', 'Team_Workspaces'],
    },
    customerHistory: {
      lifetimeOrders: 3,
      lifetimeSpend: 1150.00,
      pastDisputesWon: 1,
      pastDisputesLost: 0,
      trustScore: 94,
    },
    aiAnalysis: {
      winProbability: 0.96,
      strategy: 'Comprehensive Multi-Factor Authentication & Persistent SaaS Utilization Compendium',
      evidenceStrengths: [
        'AVS Full Match (Street + Postal Code) and CVV2 match at transaction initiation',
        '38.4 active utilization hours recorded across 5 distinct authenticated sessions',
        '2FA SMS challenge successfully completed on cardholder registered mobile device',
        'Explicit checkbox consent to annual non-refundable billing terms recorded with timestamp'
      ],
      exhibits: [
        {
          number: 'Exhibit A',
          title: 'Payment Authorization & Security Verification',
          category: 'PAYMENT_PROOF',
          summary: 'Full tokenized Stripe gateway metadata confirming AVS match and CVV match on Visa ending in 8819.'
        },
        {
          number: 'Exhibit B',
          title: 'Telemetry & Authenticated Usage Audit Trail',
          category: 'USAGE_TELEMETRY',
          summary: 'Server audit logs proving 4,318 API calls and 38.4 active dashboard hours post-purchase with 2FA verification.'
        },
        {
          number: 'Exhibit C',
          title: 'Terms of Service & Non-Refundable Acceptance',
          category: 'TERMS_ACCEPTANCE',
          summary: 'Cryptographic checkout log showing affirmative checkbox consent to merchant Terms of Service and Cancellation Policy.'
        }
      ],
      rebuttalLetter: `REPRESENTMENT REBUTTAL STATEMENT
To: STRIPE Dispute Resolution & Card Issuing Bank
Dispute Reference: dp_saas_2026_091 | Order ID: ord_saas_44812
Disputed Amount: $450.00 USD | Reason Code: 10.4_FRAUD_CARD_ABSENT
Cardholder: Alexander Vance (Visa ending in 8819)

Dear Chargeback Resolution Specialist,

This document serves as formal contestation of the chargeback initiated on order ord_saas_44812. We provide conclusive, multi-system evidence demonstrating that the cardholder authorized the transaction, received continuous commercial benefit of the SaaS service, and actively utilized the platform.

I. TRANSACTION VALIDITY & FRAUD REFUTATION
The purchase was authenticated with full security compliance:
- Address Verification Service (AVS): PASS / FULL MATCH (Street & Postal Code 78701)
- Card Verification Value (CVV2): PASS / FULL MATCH
- Originating IP: 198.51.100.42 (Austin, TX) matching the cardholder registration and subsequent login profile.

II. PROOF OF ACTIVE UTILIZATION & BENEFIT
The cardholder established recurring, authenticated access to our SaaS platform immediately following checkout. Our server logs record 38.4 hours of active enterprise feature utilization across 5 distinct sessions verified with 2-Factor Authentication. The claim of unauthorized transaction is fundamentally contradicted by persistent authenticated usage.

III. POLICY ACCEPTANCE & RECOVERY REQUEST
Prior to transaction settlement, the cardholder affirmatively consented to our Terms of Service. In accordance with Visa Core Rules on Cardholder-Initiated Disputes, we respectfully request immediate reversal of this dispute and release of the contested $450.00 USD to our merchant account.

Respectfully submitted,
Dispute Defense Operations, DisputeRocket Automated Settlement Unit`
    }
  },
  {
    id: 'ecom-physical-delivery',
    title: 'E-Commerce Store — $899 Studio Reference Headphones',
    businessType: 'E-Commerce',
    disputeId: 'dp_ecom_2026_104',
    transactionId: 'txn_ecom_994102',
    orderId: 'ord_ecom_99214',
    customerId: 'cust_sarah_chen',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@studioaudio.com',
    processor: 'SHOPIFY',
    amount: 899.00,
    currency: 'USD',
    reasonCode: '13.1_MERCHANDISE_NOT_RECEIVED',
    reasonDescription: 'Customer filed chargeback claiming physical package was never received.',
    deadlineDays: 4,
    hoursRemaining: 92,
    order: {
      productName: 'Audeze Master Studio Reference Headphones (Custom Wood Finish)',
      orderDate: '2026-08-01 10:14 UTC',
      cardLast4: '1092',
      cardBrand: 'MASTERCARD',
      avsMatch: true,
      cvvMatch: true,
      ipAddress: '192.0.2.88 (New York, NY)',
      billingAddress: '350 5th Ave, New York, NY 10118',
      termsAccepted: true,
    },
    delivery: {
      carrier: 'FedEx Priority Overnight',
      trackingNumber: '781290481290',
      shippedDate: '2026-08-02 16:30 UTC',
      deliveredDate: '2026-08-04 11:24 UTC',
      signedBy: 'S. CHEN',
      gpsCoordinates: '40.7484° N, 73.9857° W',
      status: 'DELIVERED',
    },
    customerHistory: {
      lifetimeOrders: 4,
      lifetimeSpend: 2450.00,
      pastDisputesWon: 2,
      pastDisputesLost: 0,
      trustScore: 98,
    },
    aiAnalysis: {
      winProbability: 0.98,
      strategy: 'Indisputable Proof of Delivery with GPS Coordinates & Signature Confirmation',
      evidenceStrengths: [
        'FedEx Priority Overnight tracking confirms delivery to the exact billing address',
        'Direct recipient signature captured: "S. CHEN"',
        'Carrier GPS delivery coordinates (40.7484° N, 73.9857° W) match the delivery location within 5 meters',
        'Billing address and shipping address are 100% identical'
      ],
      exhibits: [
        {
          number: 'Exhibit A',
          title: 'Order Confirmation & Matched Billing/Shipping Addresses',
          category: 'PAYMENT_PROOF',
          summary: 'Shopify checkout receipt showing identical billing and shipping addresses with AVS Postal and Street Match.'
        },
        {
          number: 'Exhibit B',
          title: 'Carrier Proof of Delivery & Signature Confirmation',
          category: 'PROOF_OF_DELIVERY',
          summary: 'Official FedEx delivery docket with tracking #781290481290, signature "S. CHEN", and GPS verification.'
        },
        {
          number: 'Exhibit C',
          title: 'Merchant Shipping & Non-Receipt Claim Policy',
          category: 'TERMS_ACCEPTANCE',
          summary: 'Customer checkout acknowledgement of signature requirement and carrier delivery terms.'
        }
      ],
      rebuttalLetter: `REPRESENTMENT REBUTTAL STATEMENT
To: SHOPIFY Payments & Card Issuing Bank
Dispute Reference: dp_ecom_2026_104 | Order ID: ord_ecom_99214
Disputed Amount: $899.00 USD | Reason Code: 13.1_MERCHANDISE_NOT_RECEIVED
Cardholder: Sarah Chen (Mastercard ending in 1092)

Dear Chargeback Review Team,

This rebuttal refutes the dispute claiming "Merchandise Not Received" for transaction ord_ecom_99214. We provide certified carrier proof demonstrating that the merchandise was shipped to the verified billing address and delivered with signature confirmation.

I. TRANSACTION & ADDRESS VALIDATION
The transaction was authorized with full address verification:
- Shipping Address: 350 5th Ave, New York, NY 10118 (Matches Billing Address exactly)
- Address Verification Service (AVS): PASS / FULL MATCH

II. CONCLUSIVE CARRIER PROOF OF DELIVERY
The merchandise was dispatched via FedEx Priority Overnight (Tracking #781290481290) and successfully delivered on August 4, 2026 at 11:24 UTC.
- Direct Recipient Signature: "S. CHEN"
- Carrier GPS Coordinates: 40.7484° N, 73.9857° W (Confirmed at recipient front desk)

III. CONCLUSION & RECOVERY
The merchandise was delivered in accordance with Mastercard Core Rules. We respectfully request the dispute be resolved in the merchant's favor and the disputed $899.00 USD be returned.

Respectfully submitted,
Dispute Defense Operations, DisputeRocket Automated Settlement Unit`
    }
  }
];
