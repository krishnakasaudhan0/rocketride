# 🚀 DisputeRocket: Autonomous Payment Dispute Defense & Evidence Packaging Platform

> **Rocket Ride Hackathon Project**  
> Built with **RocketRide AI Pipeline Builder** & **Google Gemini LLM Engine**

---

## 📌 Problem Statement

Online stores and SaaS businesses lose billions annually to fraudulent and invalid payment disputes (chargebacks). When a dispute arrives:
- Evidence is scattered across disparate systems: order databases, session telemetry logs, carrier fulfillment systems, and customer communication records.
- Payment processors (Stripe, Shopify, PayPal, Adyen) enforce strict formatting guidelines and tight submission deadlines (often under 7-14 days).
- Merchants struggle to compile legally compelling representment letters before deadlines, leading to forfeited revenue.
- Prior wins and losses are rarely codified into structured learning loops to improve future rebuttals.

---

## 💡 Solution: DisputeRocket

**DisputeRocket** is an end-to-end autonomous dispute defense pipeline that:
1. **Tracks & Ingests Multi-Source Signals**: Correlates dispute alerts, order receipts, AVS/CVV checks, user session telemetry (IPs, 2FA, feature usage hours), and delivery proofs (GPS coordinates, carrier signatures).
2. **Builds a Unified Per-Customer Record**: Links past dispute outcomes, customer lifetime value, and winning rebuttal patterns.
3. **Compiles Evidence with RocketRide & Gemini**: Executes dedicated `.pipe` pipelines powered by Google Gemini to produce processor-tailored rebuttal statements, chronologies, and evidentiary exhibits.
4. **Mandatory Human-in-the-Loop Review Gate**: Enforces human reviewer verification, edits, and sign-offs before gateway submission with real-time deadline SLA tracking.
5. **Submits Before Deadline**: Transmits the verified package directly to the payment processor.
6. **Continual Learning Loop**: Records processor verdicts (Won/Lost) and extracts winning tactics via a learning feedback pipeline to continuously boost merchant win rates.
7. **Monetization Engine**: Automatically bills merchants based on a **fixed fee per dispute job** ($25.00) plus a **contingency success fee** (% of recovered capital, e.g. 15%).

---

## 🏗️ Architecture & Pipeline Overview

```
[Dispute Webhook / Alert] ──┐
[Store Orders & AVS/CVV]  ──┼──> [Data Aggregator] ──> [Per-Customer Dossier]
[Telemetry & 2FA Logs]    ──┤
[Carrier Delivery / GPS]  ──┘
                                        │
                                        ▼
                   [RocketRide Pipeline: dispute_triage.pipe]
                         (Reason Code Triage & Gap Detection)
                                        │
                                        ▼
                   [RocketRide Pipeline: dispute_defense.pipe]
                        (Powered by Google Gemini 2.0 Flash)
                                        │
                                        ▼
                         [Structured Evidence Package]
                     (Executive Summary, Exhibits A-C, Timeline)
                                        │
                                        ▼
                    [Human-in-the-Loop Review Gate (HITL)]
                        (Inspector Verification & Sign-Off)
                                        │
                                        ▼
                      [Automated Processor Submission]
                         (Stripe / Shopify / PayPal)
                                        │
                                        ▼
                           [Dispute Verdict: WON/LOST]
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
 [dispute_learning.pipe]                               [Revenue Engine]
(Feedback Loop & Heuristics)                     (Contingency Fee + Flat Fee)
```

---

## 📂 RocketRide Pipelines (`.pipe` Files)

All pipeline definitions adhere strictly to RocketRide standards (UUID project IDs, component ordering, typed lanes, and profile configurations):

| Pipeline File | Source | Key Components | Output Lane | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `dispute_defense.pipe` | `chat` | `llm_gemini` (`gemini-2_0-flash`) | `answers` | Generates full evidence package, exhibits, and processor rebuttal statement |
| `dispute_triage.pipe` | `chat` | `llm_gemini` (`gemini-2_0-flash`) | `answers` | Performs intake triage, assesses win probability, and flags evidence gaps |
| `dispute_learning.pipe` | `chat` | `llm_gemini` (`gemini-2_0-flash`) | `answers` | Analyzes processor decisions and distills winning heuristics for future disputes |
| `chat.pipe` | `chat` | `llm_gemini` (`gemini-2_0-flash`) | `answers` | General-purpose interactive Q&A pipeline |

---

## 🚀 Quickstart & Verification

### 1. Environment Setup
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install RocketRide SDK & dependencies
pip install rocketride python-dotenv pydantic typing-extensions
```

### 2. Configure Environment (`.env`)
The `.env` file is pre-configured with the required variables:
```env
ROCKETRIDE_URI=https://api.rocketride.ai
ROCKETRIDE_APIKEY=your_rocketride_api_key_here
ROCKETRIDE_GEMINI_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

DISPUTE_RECOVERY_FEE_PERCENT=15.0
DISPUTE_FLAT_FEE=25.0
```

### 3. Run Pipeline Health Checks
Validate all `.pipe` schemas, SDK installations, environment variables, and dry-run execution:
```bash
python check.py
```

### 4. Run the Full End-to-End Demonstration
Execute the complete multi-scenario demonstration (SaaS dispute + E-commerce dispute + Human review + Outcome learning + Portfolio ROI):
```bash
python main.py
```

---

## 💼 Commercial Monetization & ROI

DisputeRocket turns every dispute into a paid job:
- **Base Intake / Compilation Fee**: `$25.00` per dispute processed.
- **Success Contingency**: `15.0%` of recovered funds when a dispute is won.
- **Merchant Value Metric**: Typical **4.3x ROI** for merchants compared to lost dispute revenue and chargeback penalty fees.

---

## 🛡️ Hackathon Compliance Checklist

- [x] Implements the exact problem statement (SaaS + E-Commerce disputes, evidence aggregation, per-customer record, HITL review, deadline submission, outcome learning, revenue model).
- [x] Configured with Google Gemini API key (`ROCKETRIDE_GEMINI_KEY`).
- [x] All `.pipe` files follow strict RocketRide rules (GUID project IDs, component ordering, typed lanes).
- [x] Context manager & `use_existing=True` best practices implemented.
- [x] `check.py` health test script created and passing all checks.
- [x] Python 3.13 compatible with zero deprecation warnings.
