#!/bin/bash
set -e

# Determine the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DEMO_BIN="${DIR}/../build/bb84_demo"

if [ ! -f "$DEMO_BIN" ]; then
    echo "Error: bb84_demo binary not found at $DEMO_BIN. Please build the project first."
    exit 1
fi

echo "========================================="
echo "Running End-to-End QKD Engine tests..."
echo "========================================="

# Test 1: Run with Eve OFF and verify ACCEPTED
echo -n "Test 1: Run with Eve OFF... "
OUT_OFF=$("$DEMO_BIN" --bits 10000)
if echo "$OUT_OFF" | grep -q "Status:         ACCEPTED" && echo "$OUT_OFF" | grep -q "Final key size: 256 bits"; then
    echo "PASSED"
else
    echo "FAILED"
    echo "Output was:"
    echo "$OUT_OFF"
    exit 1
fi

# Test 2: Run with Eve ON and verify REJECTED
echo -n "Test 2: Run with Eve ON (Intercept-Resend)... "
OUT_ON=$("$DEMO_BIN" --bits 10000 --eve)
if echo "$OUT_ON" | grep -q "Status:         REJECTED" && echo "$OUT_ON" | grep -q "Final key size: 0 bits"; then
    echo "PASSED"
else
    echo "FAILED"
    echo "Output was:"
    echo "$OUT_ON"
    exit 1
fi

# Test 3: Run with invalid arguments and verify error exit code
echo -n "Test 3: Run with invalid arguments... "
if "$DEMO_BIN" --invalid-flag >/dev/null 2>&1; then
    echo "FAILED (Expected non-zero exit status)"
    exit 1
else
    echo "PASSED"
fi

echo "========================================="
echo "All E2E tests PASSED successfully!"
echo "========================================="
exit 0
