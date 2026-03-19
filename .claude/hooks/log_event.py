#!/usr/bin/env python3
import json
import os
from datetime import datetime, timezone
from pathlib import Path
import sys


def main() -> None:
    label = sys.argv[1] if len(sys.argv) > 1 else "hook-event"
    raw = sys.stdin.read() or "{}"
    data = json.loads(raw)
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
    log_dir = project_dir / ".claude" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "workflow-events.log"
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": label,
        "payload": data,
    }
    with log_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event) + "\n")


if __name__ == "__main__":
    main()
