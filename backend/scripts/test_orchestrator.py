from app.agents.analysis_orchestrator import AnalysisOrchestrator


def main() -> None:
    orchestrator = AnalysisOrchestrator()

    sample_document = """
Information Security Policy

Passwords must contain at least 6 characters.

Employees may share accounts.

Multi-factor authentication is optional.

There is no formal incident response plan.

USB devices are unrestricted.

Access reviews are not performed.
"""

    result = orchestrator.analyze(sample_document)

    print("=" * 80)
    print("FINAL ANALYSIS")
    print("=" * 80)

    print()
    print(f"Overall Risk Score : {result.overall_risk_score}")
    print(f"Overall Risk Level : {result.overall_risk_level}")

    print()
    print("=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)

    print(result.executive_summary.overview)
    print()

    print("Business Impact:")
    print(result.executive_summary.business_impact)
    print()

    print("Recommended Next Steps:")

    for step in result.executive_summary.recommended_next_steps:
        print(f"- {step}")

    print()
    print("=" * 80)
    print("SECURITY FINDINGS")
    print("=" * 80)

    for finding in result.security.findings:
        print(f"[{finding.severity}] {finding.title}")
        print(f"Category: {finding.category}")
        print(f"Description: {finding.description}")
        print(f"Recommendation: {finding.recommendation}")
        print("-" * 80)

    print()
    print("=" * 80)
    print("COMPLIANCE FINDINGS")
    print("=" * 80)

    for finding in result.compliance.findings:
        print(f"Framework: {finding.framework}")
        print(f"Control: {finding.control}")
        print(f"Status: {finding.status}")
        print(f"Recommendation: {finding.recommendation}")
        print("-" * 80)


if __name__ == "__main__":
    main()