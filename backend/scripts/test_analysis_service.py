from pathlib import Path

from fastapi import UploadFile

from app.services.analysis_service import AnalysisService


async def main() -> None:
    service = AnalysisService()

    with Path("sample.txt").open("rb") as file:
        upload = UploadFile(
            filename="sample.txt",
            file=file,
        )

        result = await service.analyze_file(upload)

    print("=" * 80)
    print("ANALYSIS RESULT")
    print("=" * 80)

    print(f"Overall Risk Score : {result.overall_risk_score}")
    print(f"Overall Risk Level : {result.overall_risk_level}")

    print()
    print("Executive Summary")
    print(result.executive_summary.overview)

    print()
    print("Top Priorities")

    for priority in result.executive_summary.recommended_next_steps:
        print(f"- {priority}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())