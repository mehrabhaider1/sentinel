from pathlib import Path

from app.parsers.text_parser import TextParser


def main() -> None:
    parser = TextParser()

    with Path("sample.txt").open("rb") as file:
        text = parser.extract_text(file)

    print("=" * 50)
    print("Extracted Text")
    print("=" * 50)
    print(text)


if __name__ == "__main__":
    main()