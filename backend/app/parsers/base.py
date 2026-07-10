"""
Base interface for document parsers.

Every parser converts an uploaded document into plain text that can
be analyzed by Sentinel AI.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import BinaryIO


class BaseParser(ABC):
    """
    Abstract base class for all document parsers.
    """

    @abstractmethod
    def extract_text(
        self,
        file: BinaryIO,
    ) -> str:
        """
        Extract plain text from a document.

        Args:
            file:
                A binary file-like object.

        Returns:
            Extracted document text.
        """
        raise NotImplementedError