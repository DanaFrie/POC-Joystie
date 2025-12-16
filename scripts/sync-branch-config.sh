#!/bin/bash
# Bash script to sync configuration files based on git branch
# This script detects the current branch and copies the appropriate config files
# Usage: ./scripts/sync-branch-config.sh [branch]

# Don't exit on error - we want to continue even if branch detection fails
set +e

# Get branch from parameter or detect from git/environment
BRANCH="${1:-}"

if [ -z "$BRANCH" ]; then
    # Try environment variable first (App Hosting might set this)
    if [ -n "$BRANCH_NAME" ]; then
        BRANCH="$BRANCH_NAME"
    elif [ -n "$GITHUB_REF_NAME" ]; then
        BRANCH="$GITHUB_REF_NAME"
    elif [ -n "$CI_BRANCH" ]; then
        BRANCH="$CI_BRANCH"
    fi
    
    # Try to detect branch from git
    if [ -z "$BRANCH" ] && command -v git &> /dev/null; then
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    fi
    
    # If still no branch, try to read from .git/HEAD as last resort
    if [ -z "$BRANCH" ] && [ -f ".git/HEAD" ]; then
        HEAD_REF=$(cat .git/HEAD 2>/dev/null || echo "")
        if [[ "$HEAD_REF" == *"refs/heads/main"* ]] || [[ "$HEAD_REF" == *"refs/heads/master"* ]]; then
            BRANCH="main"
        elif [[ "$HEAD_REF" == *"refs/heads/"* ]]; then
            # Extract branch name from ref
            BRANCH=$(echo "$HEAD_REF" | sed 's|.*refs/heads/||')
        fi
    fi
    
    # If still no branch, check if apphosting.prod.yaml exists (indicates main branch)
    if [ -z "$BRANCH" ] && [ -f "apphosting.prod.yaml" ]; then
        echo "Info: apphosting.prod.yaml found, assuming main branch" >&2
        BRANCH="main"
    fi
    
    # Last resort: check current apphosting.yaml content to infer branch
    if [ -z "$BRANCH" ] && [ -f "apphosting.yaml" ]; then
        if grep -q "FIREBASE_API_KEY_PROD_SECRET" apphosting.yaml 2>/dev/null; then
            echo "Info: apphosting.yaml contains PROD secrets, assuming main branch" >&2
            BRANCH="main"
        elif grep -q "FIREBASE_API_KEY_INTGR_SECRET" apphosting.yaml 2>/dev/null; then
            echo "Info: apphosting.yaml contains INTGR secrets, assuming intgr branch" >&2
            BRANCH="intgr"
        fi
    fi
    
    if [ -z "$BRANCH" ]; then
        echo "Warning: Could not detect git branch, defaulting to intgr" >&2
        BRANCH="intgr"
    fi
fi

# Re-enable exit on error for the rest of the script
set -e

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

