"""
DisputeRocket: AI Payment Dispute Defense & Evidence Packaging Platform.
Complete end-to-end demonstration for the Rocket Ride Hackathon.
"""

import asyncio
from datetime import datetime, timedelta, timezone
import json
import os
import sys

from dispute_core import DisputeRocketCore
from models import DisputeAlert, DisputeReasonCode, ProcessorType

# Formatting helpers
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner():
    banner = f"""
{BOLD}{CYAN}╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║      🚀 DISPUTEROCKET: AUTONOMOUS PAYMENT DISPUTE DEFENSE SYSTEM          ║
║      Powered by RocketRide AI Pipelines & Google Gemini LLM Engine        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝{RESET}
"""
    print(banner)


async def run_scenario_saas_dispute(core: DisputeRocketCore):
    print(f"\n{BOLD}{MAGENTA}=========================================================================={RESET}")
    print(f"{BOLD}{MAGENTA}▶ SCENARIO 1: SaaS Business - $450 Annual Subscription 'Fraud' Dispute     {RESET}")
    print(f"{BOLD}{MAGENTA}=========================================================================={RESET}")

    now = datetime.now(timezone.utc)
    due_date = now + timedelta(days=6, hours=14)

    saas_alert = DisputeAlert(
        dispute_id="dp_saas_2026_091",
        transaction_id="txn_stripe_8821941",
        order_id="ord_saas_44812",
        customer_id="cust_saas_9821",
        processor=ProcessorType.STRIPE,
        amount=450.00,
        currency="USD",
        reason_code=DisputeReasonCode.FRAUD_CARD_ABSENT,
        processor_reason_description="Cardholder filed chargeback stating transaction was unrecognized/fraudulent.",
        disputed_at=now,
        evidence_due_date=due_date,
    )

    print(f"\n{BOLD}[Step 1/5] Ingesting Dispute Alert & Multi-Source Cross-Correlation...{RESET}")
    print(f"  • Dispute ID: {CYAN}{saas_alert.dispute_id}{RESET} | Gateway: {CYAN}{saas_alert.processor.value}{RESET}")
    print(f"  • Amount: {BOLD}${saas_alert.amount:.2f} {saas_alert.currency}{RESET} | Reason: {YELLOW}{saas_alert.reason_code.value}{RESET}")
    print(f"  • Evidence Deadline: {due_date.strftime('%Y-%m-%d %H:%M UTC')} (SLA: 6 days remaining)")

    # 1. Processing pipeline
    print(f"\n{BOLD}[Step 2/5] Executing RocketRide AI Pipeline (Triage & Gemini Defense Compilation)...{RESET}")
    print(f"  • Pipeline: {CYAN}dispute_triage.pipe{RESET} -> {CYAN}dispute_defense.pipe{RESET}")
    print(f"  • LLM Engine: {GREEN}Google Gemini (gemini-2_0-flash){RESET}")

    result = await core.process_new_dispute_alert(saas_alert)
    triage = result["triage_summary"]
    evidence_pkg = result["evidence_package"]

    print(f"\n  {BOLD}{GREEN}✓ AI Triage Analysis Completed:{RESET}")
    print(f"    - Win Probability Score: {BOLD}{GREEN}{triage.get('win_probability', 0.9)*100:.0f}%{RESET}")
    print(f"    - Defense Strategy: {triage.get('recommended_defense_strategy')}")
    print(f"    - Key Evidence Strengths Detected:")
    for st in triage.get("evidence_strengths", []):
        print(f"      ✔ {st}")

    print(f"\n  {BOLD}{GREEN}✓ Compiled Evidence Exhibits ({len(evidence_pkg.get('exhibits', []))} Exhibits):{RESET}")
    for i, ex in enumerate(evidence_pkg.get("exhibits", []), 1):
        print(f"    [{i}] {BOLD}{ex.get('title')}{RESET} ({ex.get('category')}):")
        print(f"        {ex.get('summary')}")

    print(f"\n  {BOLD}{GREEN}✓ Formatted Processor Rebuttal Statement Preview:{RESET}")
    letter = evidence_pkg.get("rebuttal_letter_text", "")
    preview_lines = letter.strip().split("\n")[:12]
    for line in preview_lines:
        print(f"    | {line}")
    print(f"    | ... [Full {len(preview_lines)+15}-line legal representment dossier attached] ...")

    # 2. Human in the Loop Review
    print(f"\n{BOLD}[Step 3/5] Mandatory Human-in-the-Loop (HITL) Review Gate...{RESET}")
    print(f"  • System Rule: {YELLOW}A human must verify and sign off before every payment processor submission.{RESET}")
    
    pending_list = core.review_manager.list_pending_reviews(core.aggregator.disputes)
    print(f"  • Queue Status: {len(pending_list)} dispute(s) awaiting review.")

    print(f"  • Reviewer Action: {CYAN}Marcus Thorne (Lead Risk Officer){RESET} inspecting evidence...")
    await asyncio.sleep(0.5)

    approved_pkg = core.human_review_and_approve(
        dispute_id=saas_alert.dispute_id,
        reviewer_name="Marcus Thorne (Lead Risk Officer)",
        notes="Confirmed 2FA authentication logs, IP match to Austin TX, and 38.4 hours of post-purchase SaaS usage. Rebuttal verified.",
    )
    print(f"  {BOLD}{GREEN}✓ SIGN-OFF COMPLETE:{RESET} Approved by {approved_pkg.reviewed_by} at {approved_pkg.reviewed_at.strftime('%H:%M:%S UTC')}.")

    # 3. Submission to processor
    print(f"\n{BOLD}[Step 4/5] Secure Automated Submission to Payment Gateway...{RESET}")
    sub_res = await core.submit_defense_to_processor(saas_alert.dispute_id)
    print(f"  {BOLD}{GREEN}✓ Transmitted to {sub_res['processor']} API before deadline!{RESET}")
    print(f"  • Transmission Receipt Token: {CYAN}{sub_res['submission_receipt_token']}{RESET}")

    # 4. Outcome & Learning Loop
    print(f"\n{BOLD}[Step 5/5] Ingesting Gateway Resolution Outcome & Machine Learning Feedback Loop...{RESET}")
    await asyncio.sleep(0.5)
    
    outcome_res = await core.record_dispute_outcome_and_learn(
        dispute_id=saas_alert.dispute_id,
        outcome="WON",
        processor_feedback="Card issuer reviewed AVS match and 2FA session logs; dispute closed in merchant favor.",
    )

    print(f"  {BOLD}{GREEN}★ DISPUTE WON! Recovered ${outcome_res['recovered_amount']:.2f} USD{RESET}")
    print(f"  • AI Winning Factors Extracted (dispute_learning.pipe):")
    for f in outcome_res.get("winning_factors", []):
        print(f"    ✦ {f}")

    rev = outcome_res["revenue_billing"]
    print(f"\n  {BOLD}{CYAN}💰 Commercial Monetization Earned on Job:{RESET}")
    print(f"    - Base Intake & Compilation Fee: ${rev['flat_fee_charged']:.2f}")
    print(f"    - Success Contingency ({rev['contingency_fee_percent']}% of ${outcome_res['recovered_amount']:.2f}): ${rev['contingency_fee_charged']:.2f}")
    print(f"    - {BOLD}Total DisputeRocket Revenue: ${rev['total_revenue_earned']:.2f}{RESET}")
    print(f"    - {BOLD}{GREEN}Merchant Net Capital Saved: ${outcome_res['recovered_amount'] - rev['total_revenue_earned']:.2f}{RESET}")


async def run_scenario_ecom_dispute(core: DisputeRocketCore):
    print(f"\n{BOLD}{MAGENTA}=========================================================================={RESET}")
    print(f"{BOLD}{MAGENTA}▶ SCENARIO 2: E-Commerce Store - $899 Studio Reference Headphones Dispute  {RESET}")
    print(f"{BOLD}{MAGENTA}=========================================================================={RESET}")

    now = datetime.now(timezone.utc)
    due_date = now + timedelta(days=4, hours=8)

    ecom_alert = DisputeAlert(
        dispute_id="dp_ecom_2026_104",
        transaction_id="txn_shopify_992144",
        order_id="ord_ecom_99214",
        customer_id="cust_ecom_5512",
        processor=ProcessorType.SHOPIFY,
        amount=899.00,
        currency="USD",
        reason_code=DisputeReasonCode.PRODUCT_NOT_RECEIVED,
        processor_reason_description="Cardholder claimed physical merchandise was never received at address.",
        disputed_at=now,
        evidence_due_date=due_date,
    )

    print(f"\n{BOLD}[Step 1/5] Ingesting Dispute Alert & Multi-Source Cross-Correlation...{RESET}")
    print(f"  • Dispute ID: {CYAN}{ecom_alert.dispute_id}{RESET} | Gateway: {CYAN}{ecom_alert.processor.value}{RESET}")
    print(f"  • Amount: {BOLD}${ecom_alert.amount:.2f} {ecom_alert.currency}{RESET} | Reason: {YELLOW}{ecom_alert.reason_code.value}{RESET}")

    print(f"\n{BOLD}[Step 2/5] Executing RocketRide AI Pipeline (Carrier Cross-Matching & Defense Packing)...{RESET}")
    result = await core.process_new_dispute_alert(ecom_alert)
    evidence_pkg = result["evidence_package"]

    print(f"  {BOLD}{GREEN}✓ Evidence Package Generated (Win Probability: {evidence_pkg.get('estimated_win_probability', 0.9)*100:.0f}%):{RESET}")
    for ex in evidence_pkg.get("exhibits", []):
        print(f"    • {BOLD}{ex.get('title')}{RESET}: {ex.get('summary')}")

    print(f"\n{BOLD}[Step 3/5] Mandatory Human Review Gate...{RESET}")
    approved_pkg = core.human_review_and_approve(
        dispute_id=ecom_alert.dispute_id,
        reviewer_name="Sarah Chen (Compliance Lead)",
        notes="Verified FedEx tracking #982144810291 delivered to 350 5th Ave NYC with GPS match and signature 'E. ROSTOVA'. Approved.",
    )
    print(f"  {BOLD}{GREEN}✓ SIGN-OFF COMPLETE:{RESET} Approved by {approved_pkg.reviewed_by}.")

    print(f"\n{BOLD}[Step 4/5] Secure Automated Submission to Shopify Payments...{RESET}")
    sub_res = await core.submit_defense_to_processor(ecom_alert.dispute_id)
    print(f"  {BOLD}{GREEN}✓ Transmitted to {sub_res['processor']} API!{RESET} Receipt: {CYAN}{sub_res['submission_receipt_token']}{RESET}")

    print(f"\n{BOLD}[Step 5/5] Resolution Outcome & Revenue Ledger...{RESET}")
    outcome_res = await core.record_dispute_outcome_and_learn(
        dispute_id=ecom_alert.dispute_id,
        outcome="WON",
        processor_feedback="Cardholder signature and GPS carrier proof validated; funds reversed to merchant.",
    )
    print(f"  {BOLD}{GREEN}★ DISPUTE WON! Recovered ${outcome_res['recovered_amount']:.2f} USD{RESET}")

    rev = outcome_res["revenue_billing"]
    print(f"  {BOLD}{CYAN}💰 Revenue Earned: ${rev['total_revenue_earned']:.2f}{RESET} (${rev['flat_fee_charged']:.2f} flat + ${rev['contingency_fee_charged']:.2f} contingency 15%)")


def print_portfolio_summary(core: DisputeRocketCore):
    summary = core.revenue_engine.get_financial_summary()
    print(f"\n{BOLD}{CYAN}╔═══════════════════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}{CYAN}║             DISPUTEROCKET PORTFOLIO FINANCIAL SUMMARY & ROI               ║{RESET}")
    print(f"{BOLD}{CYAN}╠═══════════════════════════════════════════════════════════════════════════╣{RESET}")
    print(f"║  • Total Disputes Processed:        {BOLD}{summary['total_disputes_processed']:<37}{RESET}║")
    print(f"║  • Disputes Successfully Won:       {BOLD}{summary['disputes_won']:<37}{RESET}║")
    print(f"║  • Platform Win Rate:               {BOLD}{GREEN}{summary['win_rate_percent']:<37}{RESET}║")
    print(f"║  • Total Disputed Volume Defended:  {BOLD}{summary['total_disputed_volume']:<37}{RESET}║")
    print(f"║  • Total Capital Recovered:         {BOLD}{GREEN}{summary['total_recovered_volume']:<37}{RESET}║")
    print(f"║  • DisputeRocket Revenue Earned:    {BOLD}{CYAN}{summary['disputerocket_revenue_earned']:<37}{RESET}║")
    print(f"║  • Net Merchant Direct Savings:     {BOLD}{GREEN}{summary['merchant_net_savings']:<37}{RESET}║")
    print(f"║  • Merchant Value ROI Multiplier:   {BOLD}{YELLOW}{summary['merchant_roi_ratio']:<37}{RESET}║")
    print(f"{BOLD}{CYAN}╚═══════════════════════════════════════════════════════════════════════════╝{RESET}\n")


async def main():
    print_banner()
    core = DisputeRocketCore(fallback_to_local_sim=True)
    await core.start()

    try:
        await run_scenario_saas_dispute(core)
        await run_scenario_ecom_dispute(core)
        print_portfolio_summary(core)
    finally:
        await core.stop()


if __name__ == "__main__":
    asyncio.run(main())
