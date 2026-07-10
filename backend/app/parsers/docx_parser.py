"""
Parser for Microsoft Word (.docx) documents.
"""

from __future__ import annotations

from typing import BinaryIO

from docx import Document

from app.parsers.base import BaseParser


class DocxParser(BaseParser):
    """
    Extract text from Microsoft Word documents.
    """

    def extract_text(
        self,
        file: BinaryIO,
    ) -> str:
        """
        Extract text from all paragraphs in a DOCX file.
        """

        document = Document(file)

        paragraphs: list[str] = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n".join(paragraphs)