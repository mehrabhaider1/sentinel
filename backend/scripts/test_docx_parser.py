from pathlib import Path

from app.parsers.docx_parser import DocxParser


def main() -> None:
    parser = DocxParser()

    with Path("sample.docx").open("rb") as file:
        text = parser.extract_text(file)

    print("=" * 60)
    print("DOCX TEXT")
    print("=" * 60)
    print(text)


if __name__ == "__main__":
    main()