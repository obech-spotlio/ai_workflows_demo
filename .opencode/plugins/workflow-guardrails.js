const READ_ONLY_PATTERN =
  /(^|_|\b)(get|list|search|query|read|browse|fetch|find|lookup|view|show|describe)(_|\b|[A-Z])/i;
const BB_READ_ONLY_PATTERN =
  /^(bitbucket_)?(list|get|search|browse|fetch|find|read|lookup|view|show|describe)/i;
const BB_CREATE_PR_PATTERN =
  /^(bitbucket_)?(create|open).*(pull|merge).*(request)|^(bitbucket_)?create[_-]?pr|^(bitbucket_)?createPullRequest$/i;
const MUTATION_PATTERN =
  /(create|update|delete|remove|edit|write|transition|assign|comment|merge|close|reopen|approve|decline|submit|move|copy|attach|upload|branch.*create|create.*branch)/i;
const SAFE_BRANCH_PATTERN = /^(feature|fix|chore)\/[A-Z][A-Z0-9]+-\d+[-/][a-z0-9._-]+$/;
const COMMIT_PATTERN =
  /^(feat|fix|chore|docs|refactor|test|build|ci|perf)(\([^)]+\))?: [A-Z][A-Z0-9]+-\d+ .+$/;

function stringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getToolName(input) {
  return String(input?.tool || "");
}

function getArgs(input, output) {
  return output?.args || input?.args || input?.toolInput || {};
}

function isProtectedBranch(branch) {
  return branch === "main" || branch === "master";
}

function extractBranchName(command) {
  const branchFlag = command.match(/(?:--branch|-b)\s+([^\s]+)/);
  if (branchFlag) return branchFlag[1];

  const checkoutFlag = command.match(/git\s+(?:switch|checkout)\s+-c\s+([^\s]+)/);
  if (checkoutFlag) return checkoutFlag[1];

  return null;
}

function extractCommitMessage(command) {
  const long = command.match(/git\s+commit(?:\s+[^-][^\s]*)*\s+-m\s+(["'])(.*?)\1/);
  if (long) return long[2];

  const short = command.match(/git\s+commit\s+-m\s+(["'])(.*?)\1/);
  if (short) return short[2];

  return null;
}

function assertMcpPolicy(toolName, args) {
  if (!toolName.includes("_")) return;

  if (toolName.startsWith("jira_")) {
    if (!READ_ONLY_PATTERN.test(toolName) || MUTATION_PATTERN.test(toolName)) {
      throw new Error(
        `Blocked Jira MCP tool '${toolName}'. Jira MCP is read-only in this workflow.`
      );
    }
    return;
  }

  if (toolName.startsWith("bitbucket_")) {
    if (BB_CREATE_PR_PATTERN.test(toolName)) return;
    if (!BB_READ_ONLY_PATTERN.test(toolName) || MUTATION_PATTERN.test(toolName)) {
      throw new Error(
        `Blocked Bitbucket MCP tool '${toolName}'. Only read operations and PR creation are allowed.`
      );
    }

    const payload = stringify(args);
    if (MUTATION_PATTERN.test(payload) && !/pull.?request/i.test(payload)) {
      throw new Error(
        `Blocked Bitbucket MCP payload for '${toolName}'. Only read operations and PR creation are allowed.`
      );
    }
  }
}

function assertGitPolicy(command) {
  if (!command || !command.includes("git")) return;

  if (/git\s+push\b/.test(command) && /(origin\s+)?(main|master)\b/.test(command)) {
    throw new Error(
      "Blocked direct push to main/master. Push a ticket branch and open a PR instead."
    );
  }

  if (
    /git\s+(?:switch|checkout)\s+-c\b/.test(command) ||
    /git\s+branch\s+(?:-m\s+)?[^\s]+/.test(command)
  ) {
    const branch = extractBranchName(command);
    if (branch && !SAFE_BRANCH_PATTERN.test(branch)) {
      throw new Error(
        `Blocked branch name '${branch}'. Use feature|fix|chore with a Jira ticket key.`
      );
    }
  }

  if (/git\s+commit\b/.test(command)) {
    const message = extractCommitMessage(command);
    if (!message) {
      throw new Error(
        "Blocked git commit without an explicit -m message. Use a conventional commit with the Jira ticket key."
      );
    }
    if (!COMMIT_PATTERN.test(message)) {
      throw new Error(
        `Blocked commit message '${message}'. Use conventional commit format with Jira ticket key.`
      );
    }
  }

  if (/git\s+push\b/.test(command)) {
    const branch = command.match(/git\s+push(?:\s+-u)?\s+\S+\s+(\S+)/)?.[1];
    if (branch && isProtectedBranch(branch)) {
      throw new Error("Blocked direct push to main/master. Push a Jira branch and create a PR.");
    }
  }
}

async function log(client, level, message, extra) {
  if (!client?.app?.log) return;
  await client.app.log({
    body: {
      service: "workflow-guardrails",
      level,
      message,
      extra,
    },
  });
}

export const WorkflowGuardrails = async ({ client, directory, worktree }) => {
  return {
    "shell.env": async (input, output) => {
      output.env.OPENCODE_WORKFLOW = "jira-bitbucket";
      output.env.OPENCODE_PROJECT_DIR = directory;
      output.env.OPENCODE_WORKTREE = worktree;
      output.env.OPENCODE_MCP_JIRA_NAME = "jira";
      output.env.OPENCODE_MCP_BITBUCKET_NAME = "bitbucket";
    },

    "tool.execute.before": async (input, output) => {
      const toolName = getToolName(input);
      const args = getArgs(input, output);

      assertMcpPolicy(toolName, args);

      if (toolName === "bash") {
        assertGitPolicy(String(args.command || ""));
      }
    },

    "tool.execute.after": async (input, output) => {
      const toolName = getToolName(input);
      const args = getArgs(input, output);

      if (
        toolName === "bash" &&
        /git\s+(commit|push|switch|checkout|branch)\b/.test(String(args.command || ""))
      ) {
        await log(client, "info", "git workflow command allowed", { command: args.command });
      }

      if (toolName.startsWith("jira_") || toolName.startsWith("bitbucket_")) {
        await log(client, "info", "mcp workflow tool allowed", { tool: toolName, args });
      }
    },

    "permission.asked": async (input) => {
      await log(client, "info", "permission asked", input);
    },

    "permission.replied": async (input) => {
      await log(client, "info", "permission replied", input);
    },

    "session.idle": async (input) => {
      await log(client, "info", "session idle", input);
    },

    "session.error": async (input) => {
      await log(client, "error", "session error", input);
    },
  };
};

export default WorkflowGuardrails;
