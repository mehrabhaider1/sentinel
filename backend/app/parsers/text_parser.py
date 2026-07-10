"""
Parser for plain text (.txt) documents.
"""

from __future__ import annotations

from typing import BinaryIO

from app.parsers.base import BaseParser


class TextParser(BaseParser):
    """
    Extract text from UTF-8 encoded text files.
    """

    def extract_text(
        self,
        file: BinaryIO,
    ) -> str:
        """
        Read the entire text file.

        Args:
            file:
                Binary file-like object.

        Returns:
            Decoded UTF-8 text.
        """

        return file.read().decode("utf-8")