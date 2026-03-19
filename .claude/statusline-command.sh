#!/usr/bin/env bash
# Claude Code status line: shows model + context window token usage
input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name // empty' 2>/dev/null)
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0' 2>/dev/null)
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty' 2>/dev/null)

used_tokens=$(echo "$input" | jq -r '
  (.context_window.current_usage.input_tokens // 0) +
  (.context_window.current_usage.output_tokens // 0) +
  (.context_window.current_usage.cache_creation_input_tokens // 0) +
  (.context_window.current_usage.cache_read_input_tokens // 0)
' 2>/dev/null)

if [ -n "$model" ]; then
  printf "%s | %'d / %'d tokens" "$model" "$used_tokens" "$context_size"
else
  printf "%'d / %'d tokens" "$used_tokens" "$context_size"
fi
