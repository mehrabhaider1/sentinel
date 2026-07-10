"""
Factory for selecting the correct document parser.
"""

from __future__ import annotations

from pathlib import Path

from app.parsers.base import BaseParser
from app.parsers.docx_parser import DocxParser
from app.parsers.pdf_parser import PDFParser
from app.parsers.text_parser import TextParser


class ParserFactory:
    """
    Factory responsible for returning the correct parser
    based on the uploaded file extension.
    """

    _PARSERS: dict[str, type[BaseParser]] = {
        ".txt": TextParser,
        ".pdf": PDFParser,
        ".docx": DocxParser,
    }

    @classmethod
    def get_parser(
        cls,
        filename: str,
    ) -> BaseParser:
        """
        Return the appropriate parser for a filename.

        Raises:
            ValueError:
                If the file type is not supported.
        """

        extension = Path(filename).suffix.lower()

        parser_class = cls._PARSERS.get(extension)

        if parser_class is None:
            raise ValueError(
                f"Unsupported file type: {extension}"
            )

        return parser_class()