#!/bin/bash
# Bash script to sync configuration files based on git branch
# This script detects the current branch and copies the appropriate config files
# Usage: ./scripts/sync-branch-config.sh [branch]

set -e

# Get branch from parameter or detect from git
BRANCH="${1:-}"

if [ -z "$BRANCH" ]; then
    # Try to detect branch from git
    if command -v git &> /dev/null; then
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    fi
    
    if [ -z "$BRANCH" ]; then
        echo "Warning: Could not detect git branch, defaulting to intgr" >&2
        BRANCH="intgr"
    fi
fi

echo "Current branch: $BRANCH"
echo ""

# Determine environment
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    ENV="prod"
else
    ENV="intgr"
fi

echo "Environment: $ENV"
echo ""

# Determine source file
if [ "$ENV" = "prod" ]; then
    SOURCE_FILE="apphosting.prod.yaml"
else
    SOURCE_FILE="apphosting.yaml"
fi

TARGET_FILE="apphosting.yaml"
DESCRIPTION="Firebase App Hosting configuration"

echo "Syncing $DESCRIPTION..."
echo "  Source: $SOURCE_FILE"
echo "  Target: $TARGET_FILE"

# Skip if source and target are the same (Intgr branch case)
if [ "$SOURCE_FILE" = "$TARGET_FILE" ]; then
    echo "  Skipping: Source and target are the same (already correct)"
    echo ""
    echo "Summary:"
    echo "  Successfully synced: 0 files (no change needed)"
    export BRANCH_ENV="$ENV"
    echo "Environment variable set: BRANCH_ENV=$ENV"
    exit 0
fi

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "  Error: Source file not found: $SOURCE_FILE" >&2
    echo "  Make sure you're on the correct branch:" >&2
    if [ "$ENV" = "prod" ]; then
        echo "    - main branch should have $SOURCE_FILE" >&2
    else
        echo "    - Intgr branch should have $SOURCE_FILE" >&2
    fi
    exit 1
fi

# Copy file
if cp "$SOURCE_FILE" "$TARGET_FILE"; then
    echo "  Success: Copied $SOURCE_FILE -> $TARGET_FILE"
else
    echo "  Error: Failed to copy $SOURCE_FILE -> $TARGET_FILE" >&2
    exit 1
fi

echo ""
echo "Summary:"
echo "  Successfully synced: 1 file"

# Export environment variable for use in other scripts
export BRANCH_ENV="$ENV"
echo "Environment variable set: BRANCH_ENV=$ENV"

