"""
Parser for PDF documents.
"""

from __future__ import annotations

from typing import BinaryIO

from pypdf import PdfReader

from app.parsers.base import BaseParser


class PDFParser(BaseParser):
    """
    Extract text from PDF files.
    """

    def extract_text(
        self,
        file: BinaryIO,
    ) -> str:
        """
        Extract text from every page in a PDF.
        """

        reader = PdfReader(file)

        pages: list[str] = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages)