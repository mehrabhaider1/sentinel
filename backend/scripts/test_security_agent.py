from app.agents.security_agent import SecurityAgent


def main() -> None:
    agent = SecurityAgent()

    sample_document = """
Password Policy

Passwords must contain at least 6 characters.

Multi-factor authentication is optional.

Employees may share accounts when necessary.

There is no incident response process.

USB devices are unrestricted.
"""

    analysis = agent.analyze(sample_document)

    print()
    print("=" * 60)
    print("Risk Score:", analysis.risk_score)
    print()
    print("Summary:")
    print(analysis.summary)
    print()

    for finding in analysis.findings:
        print(f"[{finding.severity}] {finding.title}")
        print(f"Category: {finding.category}")
        print(finding.description)
        print("Recommendation:", finding.recommendation)
        print("-" * 60)


if __name__ == "__main__":
    main()