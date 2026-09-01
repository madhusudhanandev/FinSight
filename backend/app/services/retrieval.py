"""Lightweight keyword-based retrieval over the demo financial document corpus.

Input: symbol (e.g. "TCS"), query (free-text string).
Output: list of matching document-chunk dicts (id, symbol, content, source,
page, date, is_demo), restricted to the given symbol and ranked by keyword
overlap with the query. Returns [] when nothing matches -- callers must
handle that gracefully rather than treating it as an error.

No embeddings, vector database, or external service is used by design --
see MEM3_RAG_PORTFOLIO_RULES.md section 3.
"""

import json
import re
from pathlib import Path

_DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "financial_documents.json"

_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")


def _load_documents() -> list:
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("documents", [])


def _tokenize(text: str) -> list:
    return _TOKEN_RE.findall(text.lower())


def retrieve_documents(symbol: str, query: str) -> list:
    if not symbol or not query:
        return []

    symbol_norm = symbol.strip().upper()
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    documents = _load_documents()
    symbol_docs = [
        doc for doc in documents if doc.get("symbol", "").upper() == symbol_norm
    ]

    scored = []
    for doc in symbol_docs:
        content_tokens = _tokenize(doc.get("content", ""))
        if not content_tokens:
            continue
        freq = {}
        for tok in content_tokens:
            freq[tok] = freq.get(tok, 0) + 1
        score = sum(freq.get(tok, 0) for tok in query_tokens)
        if score > 0:
            scored.append((score, doc))

    scored.sort(key=lambda pair: (-pair[0], pair[1].get("page", 0), pair[1].get("id", "")))

    return [dict(doc) for _, doc in scored]
