#!/usr/bin/env python3
"""ant: a minimal CLI wrapper around the Anthropic Messages API."""
import argparse
import json
import sys


def build_parser():
    parser = argparse.ArgumentParser(prog="ant")
    sub = parser.add_subparsers(dest="resource", required=True)

    messages = sub.add_parser("messages", help="Messages API")
    msg_sub = messages.add_subparsers(dest="action", required=True)

    create = msg_sub.add_parser("create", help="Create a message")
    create.add_argument("--model", required=True)
    create.add_argument("--max-tokens", type=int, required=True)
    create.add_argument(
        "--message",
        action="append",
        required=True,
        metavar="JSON",
        help='JSON object like \'{"role":"user","content":"Hi"}\'. Repeat for multi-turn.',
    )
    create.add_argument("--system", help="Optional system prompt")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)

    if (args.resource, args.action) != ("messages", "create"):
        print(f"ant: unsupported command", file=sys.stderr)
        return 2

    messages_list = []
    for raw in args.message:
        try:
            messages_list.append(json.loads(raw))
        except json.JSONDecodeError as e:
            print(f"ant: invalid JSON in --message: {e}", file=sys.stderr)
            return 2

    from anthropic import Anthropic

    client = Anthropic()
    kwargs = dict(
        model=args.model,
        max_tokens=args.max_tokens,
        messages=messages_list,
    )
    if args.system:
        kwargs["system"] = args.system

    response = client.messages.create(**kwargs)

    for block in response.content:
        if getattr(block, "type", None) == "text":
            print(block.text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
