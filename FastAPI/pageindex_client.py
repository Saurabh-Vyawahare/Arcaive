"""
Arcaive — PageIndex Client Wrapper

HOW PAGEINDEX WORKS:
1. SUBMIT: Give it a PDF → builds hierarchical tree structure
2. TREE:   Retrieve the tree (like intelligent table of contents)
3. QUERY:  Ask a question → LLM reasons THROUGH the tree → finds exact pages

Usage:
    from pageindex_client import pageindex_client
    doc_id = pageindex_client.submit_document("./report.pdf")
    tree = pageindex_client.get_tree(doc_id)
    answer = pageindex_client.ask("What are the risk factors?", doc_id)
"""

from config import settings
import logging

logger = logging.getLogger(__name__)


class ArcaivePageIndex:
    def __init__(self):
        self.api_key = settings.PAGEINDEX_API_KEY
        self._client = None

    @property
    def client(self):
        if self._client is None:
            if not self.api_key:
                raise ValueError("PAGEINDEX_API_KEY not set. Get one at https://docs.pageindex.ai")
            from pageindex import PageIndexClient
            self._client = PageIndexClient(api_key=self.api_key)
        return self._client

    def submit_document(self, file_path: str) -> str:
        result = self.client.submit_document(file_path)
        doc_id = result["doc_id"]
        logger.info(f"Submitted: {file_path} → {doc_id}")
        return doc_id

    def get_status(self, doc_id: str) -> str:
        return self.client.get_document(doc_id).get("status", "unknown")

    def get_tree(self, doc_id: str) -> dict:
        return self.client.get_tree(doc_id).get("result", {})

    def ask(self, question: str, doc_id: str | list[str], history: list[dict] = None) -> dict:
        messages = (history or []) + [{"role": "user", "content": question}]
        response = self.client.chat_completions(messages=messages, doc_id=doc_id)

        answer = ""
        if isinstance(response, dict):
            answer = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        elif hasattr(response, "choices") and response.choices:
            answer = response.choices[0].message.content

        return {"answer": answer, "raw_response": response}


pageindex_client = ArcaivePageIndex()
