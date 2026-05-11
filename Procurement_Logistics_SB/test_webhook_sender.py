"""Tests for webhook_sender."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from webhook_sender import (
    WebhookNotAllowedError,
    is_url_allowed,
    load_allowlist,
    send_webhook,
)


ALLOWLIST = [
    "https://hooks.example.com/*",
    "http://localhost:*",
]


class IsUrlAllowedTests(unittest.TestCase):
    def test_allowed_urls(self) -> None:
        allowed = [
            "https://hooks.example.com/",
            "https://hooks.example.com/webhook",
            "https://hooks.example.com/a/b/c",
            "https://hooks.example.com:443/path",
            "http://localhost:8080/webhook",
            "http://localhost:3000",
            "http://localhost:80/",
            "http://localhost/",
        ]
        for url in allowed:
            with self.subTest(url=url):
                self.assertTrue(is_url_allowed(url, ALLOWLIST))

    def test_disallowed_urls(self) -> None:
        denied = [
            # Scheme mismatch
            "http://hooks.example.com/foo",
            "https://localhost:8080",
            # Host confusion / suffix attacks
            "https://hooks.example.com.evil.com/foo",
            "https://evil.hooks.example.com/foo",
            "http://localhost.evil.com",
            "http://localhost.evil.com:8080",
            # Totally different host
            "https://evil.com/foo",
            # Non-HTTP schemes
            "file:///etc/passwd",
            "javascript:alert(1)",
            # Malformed
            "not-a-url",
            "",
        ]
        for url in denied:
            with self.subTest(url=url):
                self.assertFalse(is_url_allowed(url, ALLOWLIST))

    def test_default_port_is_equivalent_to_omitted_port(self) -> None:
        # Pattern omits port -> URL with default scheme port must still match.
        self.assertTrue(
            is_url_allowed("https://hooks.example.com:443/x", ALLOWLIST)
        )
        # But a non-default explicit port must not match an unported pattern.
        self.assertFalse(
            is_url_allowed("https://hooks.example.com:8443/x", ALLOWLIST)
        )

    def test_empty_allowlist_denies_everything(self) -> None:
        self.assertFalse(is_url_allowed("https://hooks.example.com/", []))


class LoadAllowlistTests(unittest.TestCase):
    def test_load_valid(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "cfg.json"
            cfg.write_text(json.dumps({"allowedHttpHookUrls": ALLOWLIST}))
            self.assertEqual(load_allowlist(cfg), ALLOWLIST)

    def test_rejects_wrong_type(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "bad.json"
            cfg.write_text(json.dumps({"allowedHttpHookUrls": "nope"}))
            with self.assertRaises(ValueError):
                load_allowlist(cfg)

    def test_rejects_non_string_entries(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "mixed.json"
            cfg.write_text(json.dumps({"allowedHttpHookUrls": ["ok", 42]}))
            with self.assertRaises(ValueError):
                load_allowlist(cfg)

    def test_missing_key_returns_empty(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "empty.json"
            cfg.write_text("{}")
            self.assertEqual(load_allowlist(cfg), [])

    def test_default_config_file(self) -> None:
        allow = load_allowlist()
        self.assertIn("https://hooks.example.com/*", allow)
        self.assertIn("http://localhost:*", allow)


class SendWebhookTests(unittest.TestCase):
    def test_rejects_disallowed_without_network(self) -> None:
        # Must raise before any network I/O happens.
        with self.assertRaises(WebhookNotAllowedError):
            send_webhook(
                "https://evil.com/foo",
                {"k": "v"},
                allowlist=ALLOWLIST,
            )

    def test_rejects_host_confusion(self) -> None:
        with self.assertRaises(WebhookNotAllowedError):
            send_webhook(
                "https://hooks.example.com.evil.com/foo",
                {"k": "v"},
                allowlist=ALLOWLIST,
            )


if __name__ == "__main__":
    unittest.main()
