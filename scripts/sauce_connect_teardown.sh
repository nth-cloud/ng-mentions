#!/bin/bash

set -e -o pipefail

CONNECT_LOG="$LOGS_DIR/sauce-connect"
CONNECT_STDOUT="$LOGS_DIR/sauce-connect.stdout"
CONNECT_STDERR="$LOGS_DIR/sauce-connect.stderr"

echo "Shutting down Sauce Connect tunnel"

killall sc

while [[ -n `ps -ef | grep "sauce-connect-" | grep -v "grep"` ]]; do
  printf "."
  sleep .5
done

echo ""
echo "Sauce Connect tunnel has been shut down"

[[ -f "$CONNECT_LOG" ]] && [[ -s "$CONNECT_LOG" ]] && echo "Sauce Connect Log:" && cat "$CONNECT_LOG";
[[ -f "$CONNECT_STDOUT" ]] && [[ -s "$CONNECT_STDOUT" ]] && echo "Sauce Connect Stdout Log:" && cat "$CONNECT_STDOUT";
[[ -f "$CONNECT_STDERR" ]] && [[ -s "$CONNECT_STDERR" ]] && echo "Sauce Connect Stderr Log:" && cat "$CONNECT_STDERR";
