#!/usr/bin/env python
"""Build the AI-learn A4 PDF book.

Three steps:
  1. mkdocs build with mkdocs-print.yml  -> site-print/print_page/
  2. serve site-print/ over localhost    (Mermaid and fonts need real HTTP)
  3. render to PDF with headless Chrome via scripts/render-pdf.mjs

Usage:
    .venv/Scripts/python scripts/build-pdf.py [-o AI-learn.pdf] [--skip-build]
"""

from __future__ import annotations

import argparse
import functools
import http.server
import socket
import socketserver
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site-print"
CONFIG = ROOT / "mkdocs-print.yml"


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):  # noqa: D102 - silence per-request logging
        pass


def serve(directory: Path, port: int) -> socketserver.TCPServer:
    handler = functools.partial(QuietHandler, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def run(cmd: list[str], **kw) -> None:
    print(f"$ {' '.join(cmd)}", flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT, **kw)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--output", default="AI-learn.pdf")
    ap.add_argument("--skip-build", action="store_true",
                    help="reuse an existing site-print/ directory")
    args = ap.parse_args()

    if not args.skip_build:
        print("\n[1/3] building print site")
        run([sys.executable, "-m", "mkdocs", "build",
             "-f", str(CONFIG), "-d", str(SITE), "--quiet"])
    else:
        print("\n[1/3] skipped (--skip-build)")

    page = SITE / "print_page" / "index.html"
    if not page.exists():
        print(f"error: {page} not found", file=sys.stderr)
        return 1
    print(f"      print page: {page.stat().st_size / 1024:.0f} KB")

    port = free_port()
    print(f"\n[2/3] serving {SITE.name}/ on 127.0.0.1:{port}")
    httpd = serve(SITE, port)

    try:
        print("\n[3/3] rendering PDF with headless Chrome")
        run(["node", str(ROOT / "scripts" / "render-pdf.mjs"),
             f"http://127.0.0.1:{port}/print_page/", args.output])
    finally:
        httpd.shutdown()

    out = ROOT / args.output
    if out.exists():
        print(f"\ndone: {out}  ({out.stat().st_size / 1_048_576:.1f} MB)")
        return 0
    print("error: no PDF produced", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
