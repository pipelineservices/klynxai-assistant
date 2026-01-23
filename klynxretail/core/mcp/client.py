from __future__ import annotations

import json
import time
from typing import Any, Dict, Optional

import requests


class MCPClient:
    def __init__(
        self,
        endpoint: str,
        protocol_version: str,
        client_name: str,
        client_version: str,
        auth_token: Optional[str] = None,
        timeout_s: int = 10,
    ) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.protocol_version = protocol_version
        self.client_name = client_name
        self.client_version = client_version
        self.auth_token = auth_token
        self.timeout_s = timeout_s
        self._session_id: Optional[str] = None
        self._initialized = False
        self._next_id = 1

    def _headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self._initialized:
            headers["MCP-Protocol-Version"] = self.protocol_version
        if self._session_id:
            headers["MCP-Session-Id"] = self._session_id
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers

    def _post(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        resp = requests.post(
            self.endpoint,
            headers=self._headers(),
            json=payload,
            timeout=self.timeout_s,
        )
        if resp.status_code == 404:
            self._session_id = None
            self._initialized = False
            return None
        resp.raise_for_status()
        session_id = resp.headers.get("MCP-Session-Id") or resp.headers.get("Mcp-Session-Id")
        if session_id:
            self._session_id = session_id
        if not resp.content:
            return None
        return resp.json()

    def _next_request_id(self) -> int:
        self._next_id += 1
        return self._next_id

    def initialize(self) -> None:
        if self._initialized:
            return
        req_id = self._next_id
        payload = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "initialize",
            "params": {
                "protocolVersion": self.protocol_version,
                "capabilities": {"roots": {"listChanged": True}},
                "clientInfo": {"name": self.client_name, "version": self.client_version},
            },
        }
        try:
            resp = self._post(payload)
        except requests.HTTPError:
            # Some servers don't implement initialize yet.
            self._initialized = True
            return
        if not resp or "error" in resp:
            self._initialized = True
            return
        result = resp.get("result", {})
        negotiated = result.get("protocolVersion")
        if negotiated:
            self.protocol_version = negotiated
        # Send initialized notification
        notification = {"jsonrpc": "2.0", "method": "notifications/initialized"}
        try:
            self._post(notification)
        except requests.RequestException:
            pass
        self._initialized = True

    def request(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self._initialized and method != "initialize":
            self.initialize()
        req_id = self._next_request_id()
        payload = {"jsonrpc": "2.0", "id": req_id, "method": method}
        if params is not None:
            payload["params"] = params
        resp = self._post(payload)
        if resp is None and self._session_id is None:
            self.initialize()
            resp = self._post(payload)
        if not resp:
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}
        return resp

    def list_tools(self) -> Dict[str, Any]:
        return self.request("tools/list")

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        return self.request("tools/call", {"name": name, "arguments": arguments})
