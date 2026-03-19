#!/usr/bin/env python3
import json


def main() -> None:
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": "Project workflow active: use /ticket-start <JIRA-KEY>, /ticket-implement <JIRA-KEY>, and /ticket-finish <JIRA-KEY>. Jira MCP is read-only. Bitbucket MCP is read-only except pull request creation. Use git CLI for all version control operations.",
        }
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
