#!/usr/bin/env python3
import json
import re
import sys
from typing import NoReturn

SAFE_BRANCH_PATTERN = re.compile(r"^(feature|fix|chore)/[A-Z][A-Z0-9]+-\d+[-/][a-z0-9._-]+$")
COMMIT_PATTERN = re.compile(r"^(feat|fix|chore|docs|refactor|test|build|ci|perf)(\([^)]+\))?: [A-Z][A-Z0-9]+-\d+ .+$")


def deny(reason: str) -> NoReturn:
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }
    print(json.dumps(payload))
    sys.exit(0)


def extract_branch_name(command: str):
    for pattern in [r"git\s+(?:switch|checkout)\s+-c\s+(\S+)", r"(?:--branch|-b)\s+(\S+)"]:
        match = re.search(pattern, command)
        if match:
            return match.group(1)
    return None


def extract_commit_message(command: str):
    for pattern in [r"git\s+commit(?:\s+[^-][^\s]*)*\s+-m\s+([\"'])(.*?)\1", r"git\s+commit\s+-m\s+([\"'])(.*?)\1"]:
        match = re.search(pattern, command)
        if match:
            return match.group(2)
    return None


def check_bash(command: str) -> None:
    if "git" not in command:
        return

    if re.search(r"git\s+push\b", command) and re.search(r"(origin\s+)?(main|master)\b", command):
        deny("Blocked direct push to main/master. Push a Jira ticket branch and open a PR instead.")

    if re.search(r"git\s+(?:switch|checkout)\s+-c\b", command):
        branch = extract_branch_name(command)
        if branch and not SAFE_BRANCH_PATTERN.match(branch):
            deny(f"Blocked branch name '{branch}'. Use feature|fix|chore with a Jira ticket key.")

    if re.search(r"git\s+commit\b", command):
        message = extract_commit_message(command)
        if not message:
            deny("Blocked git commit without an explicit -m message. Use a conventional commit with the Jira ticket key.")
        if not COMMIT_PATTERN.match(message):
            deny(f"Blocked commit message '{message}'. Use conventional commit format with Jira ticket key.")


JIRA_READ_TOOLS = {
    "getJiraIssue",
    "searchJiraIssuesUsingJql",
    "getVisibleJiraProjects",
    "getJiraProjectIssueTypesMetadata",
    "getJiraIssueTypeMetaWithFields",
    "getJiraIssueRemoteIssueLinks",
    "getTransitionsForJiraIssue",
    "lookupJiraAccountId",
    "getAccessibleAtlassianResources",
    "atlassianUserInfo",
    "search",
    "fetch",
}

BITBUCKET_ALLOWED_PREFIXES = ("get", "list", "search", "find", "fetch")
BITBUCKET_ALLOWED_EXACT = {"createPullRequest"}


def check_mcp(tool_name: str) -> None:
    if tool_name.startswith("mcp__jira__"):
        operation = tool_name.split("__", 2)[2]
        if operation not in JIRA_READ_TOOLS:
            deny(f"Blocked Jira MCP tool '{tool_name}'. Jira is read-only in this workflow.")
    elif tool_name.startswith("mcp__bitbucket__"):
        operation = tool_name.split("__", 2)[2]
        if operation in BITBUCKET_ALLOWED_EXACT:
            return
        if operation.startswith(BITBUCKET_ALLOWED_PREFIXES):
            return
        deny(
            f"Blocked Bitbucket MCP tool '{tool_name}'. Only read operations and pull request creation are allowed in this workflow."
        )


def main() -> None:
    raw = sys.stdin.read() or "{}"
    data = json.loads(raw)
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {}) or {}

    if tool_name == "Bash":
        check_bash(str(tool_input.get("command", "")))
    elif tool_name.startswith("mcp__jira__") or tool_name.startswith("mcp__bitbucket__"):
        check_mcp(tool_name)


if __name__ == "__main__":
    main()
