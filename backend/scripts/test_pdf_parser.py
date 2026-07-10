from pathlib import Path

from app.parsers.pdf_parser import PDFParser


def main() -> None:
    parser = PDFParser()

    with Path("sample.pdf").open("rb") as file:
        text = parser.extract_text(file)

    print("=" * 60)
    print("PDF TEXT")
    print("=" * 60)
    print(text)


if __name__ == "__main__":
    main()