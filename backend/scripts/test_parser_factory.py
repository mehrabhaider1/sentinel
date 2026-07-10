from app.parsers.parser_factory import ParserFactory


def main() -> None:
    filenames = [
        "policy.txt",
        "policy.pdf",
        "policy.docx",
    ]

    for filename in filenames:
        parser = ParserFactory.get_parser(filename)

        print(f"{filename} -> {parser.__class__.__name__}")


if __name__ == "__main__":
    main()