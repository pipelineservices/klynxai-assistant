from __future__ import annotations

from abc import ABC, abstractmethod


class BaseLLM(ABC):
    @abstractmethod
    async def reply(self, prompt: str) -> str:
        """Return a single assistant reply string."""
        raise NotImplementedError

