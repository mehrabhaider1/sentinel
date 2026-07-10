from app.agents.compliance_agent import ComplianceAgent


def main() -> None:
    agent = ComplianceAgent()

    sample_document = """
Information Security Policy

Passwords must contain at least 6 characters.

Employees may share accounts.

MFA is optional.

There is no incident response plan.

No access review process exists.

USB devices are unrestricted.
"""

    analysis = agent.analyze(sample_document)

    print()
    print("=" * 60)
    print("Compliance Score:", analysis.compliance_score)
    print()

    print("Summary:")
    print(analysis.summary)
    print()

    for finding in analysis.findings:
        print(f"[{finding.framework}]")
        print(f"Control: {finding.control}")
        print(f"Status : {finding.status}")
        print(f"Recommendation: {finding.recommendation}")
        print("-" * 60)


if __name__ == "__main__":
    main()