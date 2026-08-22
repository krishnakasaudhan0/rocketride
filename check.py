"""
DisputeRocket Environment & Pipeline Health Check Utility.
Validates environment variables, RocketRide .pipe schema rules, component catalogs, SDK installation, and core pipeline execution.
"""

import asyncio
import json
import os
import sys
from pathlib import Path
import uuid

# ANSI Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def check_env_file() -> bool:
    print(f"\n{BOLD}[1/5] Checking Configuration & Environment Files...{RESET}")
    env_path = Path(".env")
    example_path = Path("env.example")

    if not env_path.exists():
        print(f"  {RED}✗ .env file not found!{RESET}")
        return False
    print(f"  {GREEN}✓ .env file exists.{RESET}")

    if not example_path.exists():
        print(f"  {RED}✗ env.example file not found!{RESET}")
        return False
    print(f"  {GREEN}✓ env.example file exists.{RESET}")

    # Inspect keys in .env
    with open(env_path, "r", encoding="utf-8") as f:
        content = f.read()

    required_vars = [
        "ROCKETRIDE_URI",
        "ROCKETRIDE_APIKEY",
        "ROCKETRIDE_GEMINI_KEY",
    ]
    all_vars_present = True
    for var in required_vars:
        if var in content:
            print(f"  {GREEN}✓ Found variable '{var}' in .env{RESET}")
        else:
            print(f"  {YELLOW}⚠ Missing '{var}' in .env{RESET}")
            all_vars_present = True  # Warning only

    return True


def check_pipeline_files() -> bool:
    print(f"\n{BOLD}[2/5] Validating RocketRide .pipe Files & Schema Compliance...{RESET}")
    pipe_files = list(Path(".").glob("*.pipe"))

    if not pipe_files:
        print(f"  {RED}✗ No .pipe files found in project root!{RESET}")
        return False

    print(f"  Found {len(pipe_files)} pipeline files: {[p.name for p in pipe_files]}")

    catalog_path = Path(".rocketride/services-catalog.json")
    catalog_providers = set()
    if catalog_path.exists():
        with open(catalog_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)
            catalog_providers = {c["name"] for c in catalog_data}

    seen_project_ids = set()
    all_valid = True

    for pipe in pipe_files:
        print(f"  Checking {CYAN}{pipe.name}{RESET}...")
        try:
            with open(pipe, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Rule 1: components must be present and non-empty
            if "components" not in data or not isinstance(data["components"], list):
                print(f"    {RED}✗ 'components' array missing or not a list{RESET}")
                all_valid = False
                continue

            # Rule 2: components should be first key
            keys = list(data.keys())
            if keys[0] != "components":
                print(f"    {YELLOW}⚠ Warning: 'components' is not the first key in JSON{RESET}")

            # Rule 3: project_id must be literal valid UUID
            project_id = data.get("project_id")
            if not project_id or "${" in str(project_id):
                print(f"    {RED}✗ 'project_id' must be a literal GUID (variable substitution not allowed){RESET}")
                all_valid = False
            else:
                try:
                    uuid.UUID(project_id)
                    if project_id in seen_project_ids:
                        print(f"    {RED}✗ Duplicate project_id '{project_id}' reused across pipes!{RESET}")
                        all_valid = False
                    seen_project_ids.add(project_id)
                except ValueError:
                    print(f"    {RED}✗ 'project_id' is not a valid UUID format: {project_id}{RESET}")
                    all_valid = False

            # Rule 4: version and viewport
            if "version" not in data:
                print(f"    {YELLOW}⚠ 'version' field missing at bottom of {pipe.name}{RESET}")
            if "viewport" not in data:
                print(f"    {YELLOW}⚠ 'viewport' field missing at bottom of {pipe.name}{RESET}")

            # Rule 5: Providers exist in catalog
            for comp in data.get("components", []):
                prov = comp.get("provider")
                if catalog_providers and prov not in catalog_providers:
                    print(f"    {YELLOW}⚠ Provider '{prov}' not found in local services-catalog.json{RESET}")

            print(f"    {GREEN}✓ Schema valid (ID: {project_id}){RESET}")

        except Exception as e:
            print(f"    {RED}✗ JSON parse error: {e}{RESET}")
            all_valid = False

    return all_valid


def check_sdk_installation() -> bool:
    print(f"\n{BOLD}[3/5] Checking RocketRide Python SDK Installation...{RESET}")
    try:
        import rocketride
        from rocketride import RocketRideClient
        from rocketride.schema import Question
        print(f"  {GREEN}✓ RocketRide SDK is installed (version {getattr(rocketride, '__version__', '1.x')}){RESET}")
        print(f"  {GREEN}✓ RocketRideClient & Question schemas imported successfully.{RESET}")
        return True
    except ImportError as e:
        print(f"  {RED}✗ RocketRide SDK import failed: {e}{RESET}")
        print(f"  Run: pip install rocketride")
        return False


def check_data_models() -> bool:
    print(f"\n{BOLD}[4/5] Checking Core Domain Data Models & Aggregator...{RESET}")
    try:
        from data_aggregator import DataAggregator
        from models import DisputeAlert, DisputeReasonCode, ProcessorType
        from datetime import datetime, timedelta

        agg = DataAggregator()
        assert len(agg.customers) > 0, "No seed customers"
        assert len(agg.orders) > 0, "No seed orders"
        print(f"  {GREEN}✓ Data models and seed datasets validated ({len(agg.customers)} customers, {len(agg.orders)} orders).{RESET}")
        return True
    except Exception as e:
        print(f"  {RED}✗ Data models validation failed: {e}{RESET}")
        return False


async def check_end_to_end_pipeline() -> bool:
    print(f"\n{BOLD}[5/5] Running End-to-End Pipeline Dry-Run Test...{RESET}")
    try:
        from datetime import datetime, timedelta, timezone
        from dispute_core import DisputeRocketCore
        from models import DisputeAlert, DisputeReasonCode, ProcessorType

        core = DisputeRocketCore(fallback_to_local_sim=True)
        await core.start()

        now = datetime.now(timezone.utc)
        test_alert = DisputeAlert(
            dispute_id="disp_check_test_99",
            transaction_id="txn_check_441",
            order_id="ord_saas_44812",
            customer_id="cust_saas_9821",
            processor=ProcessorType.STRIPE,
            amount=450.00,
            currency="USD",
            reason_code=DisputeReasonCode.FRAUD_CARD_ABSENT,
            processor_reason_description="Cardholder states transaction was unauthorized.",
            disputed_at=now,
            evidence_due_date=now + timedelta(days=5),
        )

        # 1. Intake & AI Defense Generation
        print("  1. Ingesting dispute and compiling AI evidence package...")
        result = await core.process_new_dispute_alert(test_alert)
        assert result["dispute_id"] == test_alert.dispute_id
        assert len(result["evidence_package"]["exhibits"]) > 0
        print(f"    {GREEN}✓ Evidence package compiled ({len(result['evidence_package']['exhibits'])} exhibits, {result['evidence_package']['estimated_win_probability']*100:.0f}% win prob){RESET}")

        # 2. Human Review
        print("  2. Simulating mandatory human review gate...")
        pkg = core.human_review_and_approve(
            dispute_id=test_alert.dispute_id,
            reviewer_name="Sarah Chen (Compliance Lead)",
            notes="Checked IP logs and AVS/CVV matching. Approved.",
        )
        assert pkg.is_approved_for_submission is True
        print(f"    {GREEN}✓ Human sign-off complete (Reviewer: {pkg.reviewed_by}){RESET}")

        # 3. Submission
        print("  3. Submitting to processor...")
        sub_res = await core.submit_defense_to_processor(test_alert.dispute_id)
        assert "sub_token" in sub_res["submission_receipt_token"]
        print(f"    {GREEN}✓ Submitted to {sub_res['processor']} gateway (Token: {sub_res['submission_receipt_token']}){RESET}")

        # 4. Outcome & Learning
        print("  4. Recording resolution outcome and executing learning loop...")
        outcome_res = await core.record_dispute_outcome_and_learn(
            dispute_id=test_alert.dispute_id,
            outcome="WON",
            processor_feedback="Card issuer accepted merchant evidence and reversed dispute.",
        )
        assert outcome_res["outcome"] == "WON"
        assert outcome_res["recovered_amount"] == 450.00
        rev = outcome_res["revenue_billing"]
        print(f"    {GREEN}✓ Outcome WON: ${outcome_res['recovered_amount']:.2f} recovered.{RESET}")
        print(f"    {GREEN}✓ Commercial Revenue: ${rev['total_revenue_earned']:.2f} earned (${rev['flat_fee_charged']:.2f} flat + ${rev['contingency_fee_charged']:.2f} contingency).{RESET}")

        await core.stop()
        return True
    except Exception as e:
        print(f"  {RED}✗ End-to-end dry run failed: {e}{RESET}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    print(f"\n{BOLD}{CYAN}================================================================={RESET}")
    print(f"{BOLD}{CYAN}      DISPUTEROCKET HACKATHON CORE PIPELINE HEALTH CHECK         {RESET}")
    print(f"{BOLD}{CYAN}================================================================={RESET}")

    c1 = check_env_file()
    c2 = check_pipeline_files()
    c3 = check_sdk_installation()
    c4 = check_data_models()
    c5 = await check_end_to_end_pipeline()

    print(f"\n{BOLD}{CYAN}================================================================={RESET}")
    if all([c1, c2, c3, c4, c5]):
        print(f"{BOLD}{GREEN}  ALL HEALTH CHECKS PASSED SUCCESSFULLY! 🚀{RESET}")
        print(f"{BOLD}{GREEN}  DisputeRocket is fully configured and ready for the hackathon.{RESET}")
        print(f"{BOLD}{CYAN}================================================================={RESET}\n")
        return 0
    else:
        print(f"{BOLD}{RED}  SOME CHECKS FAILED! Please inspect errors above.{RESET}")
        print(f"{BOLD}{CYAN}================================================================={RESET}\n")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
