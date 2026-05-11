"""Webhook sender with URL allowlist enforcement.

Loads a list of permitted webhook URL patterns from a JSON config file and
refuses to send HTTP POST payloads to any URL that does not match.

Pattern format per allowlist entry:
    scheme://host[:port][/path]

Supported wildcards:
    * host      : fnmatch-style (e.g. "*.example.com", "*")
    * port      : literal "*" means "any port"; omitted means the scheme's
                  default port (80 for http, 443 for https)
    * path      : trailing "/*" matches any subpath; omitted or "/" matches
                  any path; otherwise an exact path match is required

URL matching is component-based (not a naive string prefix match) to avoid
bypasses such as "https://hooks.example.com.evil.com/".
"""
from __future__ import annotations

import fnmatch
import json
import re
import urllib.request
from pathlib import Path
from typing import Any, Iterable, Optional
from urllib.parse import urlparse


DEFAULT_CONFIG_PATH = Path(__file__).with_name("webhook_allowlist.json")
_DEFAULT_PORTS = {"http": "80", "https": "443"}

_PATTERN_RE = re.compile(
    r"^([a-zA-Z][a-zA-Z0-9+.\-]*)://([^/:]+)(?::([^/]+))?(/.*)?$"
)


class WebhookNotAllowedError(ValueError):
    """Raised when a webhook target URL is not permitted by the allowlist."""


def load_allowlist(path: Optional[Any] = None) -> list[str]:
    """Load the ``allowedHttpHookUrls`` list from a JSON config file.

    If ``path`` is None, the default config file bundled next to this module
    is used. A missing ``allowedHttpHookUrls`` key yields an empty list.
    """
    cfg_path = Path(path) if path is not None else DEFAULT_CONFIG_PATH
    with open(cfg_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    allow = data.get("allowedHttpHookUrls", [])
    if not isinstance(allow, list) or not all(isinstance(x, str) for x in allow):
        raise ValueError("allowedHttpHookUrls must be a list of strings")
    return allow


def _parse_pattern(pattern: str) -> tuple[str, str, Optional[str], str]:
    m = _PATTERN_RE.match(pattern)
    if not m:
        raise ValueError(f"Invalid URL pattern: {pattern!r}")
    scheme, host, port, path = m.groups()
    return scheme.lower(), host.lower(), port, path or ""


def _parse_url(url: str) -> tuple[str, str, Optional[str], str]:
    try:
        parsed = urlparse(url)
    except ValueError as e:
        raise ValueError(f"Invalid URL: {url!r}") from e
    if not parsed.scheme or not parsed.hostname:
        raise ValueError(f"Invalid URL: {url!r}")
    try:
        port = str(parsed.port) if parsed.port is not None else None
    except ValueError as e:
        raise ValueError(f"Invalid port in URL: {url!r}") from e
    return parsed.scheme.lower(), parsed.hostname.lower(), port, parsed.path or ""


def _port_matches(pattern_port: Optional[str], url_port: Optional[str], scheme: str) -> bool:
    if pattern_port == "*":
        return True
    p = pattern_port if pattern_port else _DEFAULT_PORTS.get(scheme)
    u = url_port if url_port else _DEFAULT_PORTS.get(scheme)
    return p is not None and p == u


def _path_matches(pattern_path: str, url_path: str) -> bool:
    if pattern_path in ("", "/", "/*"):
        return True
    if pattern_path.endswith("/*"):
        prefix = pattern_path[:-2]
        return url_path == prefix or url_path.startswith(prefix + "/")
    return url_path == pattern_path


def is_url_allowed(url: str, allowlist: Iterable[str]) -> bool:
    """Return True if ``url`` matches any pattern in ``allowlist``."""
    try:
        u_scheme, u_host, u_port, u_path = _parse_url(url)
    except ValueError:
        return False

    for pattern in allowlist:
        try:
            p_scheme, p_host, p_port, p_path = _parse_pattern(pattern)
        except ValueError:
            continue
        if p_scheme != u_scheme:
            continue
        if not fnmatch.fnmatchcase(u_host, p_host):
            continue
        if not _port_matches(p_port, u_port, u_scheme):
            continue
        if not _path_matches(p_path, u_path):
            continue
        return True
    return False


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Turn any redirect response into an error.

    Without this, a malicious allowlisted endpoint could 30x us into an
    internal URL that would never have passed the allowlist check.
    """

    def http_error_302(self, req, fp, code, msg, headers):  # noqa: D401
        raise WebhookNotAllowedError(
            f"Redirect blocked (Location: {headers.get('Location')!r})"
        )

    http_error_301 = http_error_302
    http_error_303 = http_error_302
    http_error_307 = http_error_302
    http_error_308 = http_error_302


def send_webhook(
    url: str,
    payload: Any,
    *,
    allowlist: Optional[Iterable[str]] = None,
    config_path: Optional[Any] = None,
    timeout: float = 10.0,
) -> tuple[int, bytes]:
    """POST ``payload`` as JSON to ``url``, enforcing the allowlist.

    Raises :class:`WebhookNotAllowedError` if the URL is not in the allowlist
    or if the remote server responds with a redirect.
    """
    if allowlist is None:
        allowlist = load_allowlist(config_path)
    allowlist = list(allowlist)

    if not is_url_allowed(url, allowlist):
        raise WebhookNotAllowedError(f"URL not in allowlist: {url!r}")

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    opener = urllib.request.build_opener(_NoRedirectHandler)
    with opener.open(req, timeout=timeout) as response:
        return response.status, response.read()
