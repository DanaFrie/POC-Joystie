# Firebase Rules Deployment Guide

## Overview

הפרויקט כולל שתי גרסאות של rules:
- **Development/Integration**: `firestore.rules`, `storage.rules`
- **Production**: `firestore.rules.prod`, `storage.rules.prod`

## ההבדלים העיקריים

### Development Rules (intgr)
- `users` collection: `allow read: if true` - מאפשר בדיקת username לפני signup
- `users` collection: `allow create: if true` - מאפשר signup ללא validation
- `storage`: validation בסיסי

### Production Rules
- `users` collection: `allow read: if isAuthenticated()` - דורש authentication
- `users` collection: `allow create` עם validation מלא (email, username length)
- `storage`: validation מחמיר (file types, filename patterns)

## שיטות Deployment

### שיטה 1: Manual Copy (פשוט)

```bash
# לפני deployment ל-production:
cp firebase/firestore.rules.prod firebase/firestore.rules
cp firebase/storage.rules.prod firebase/storage.rules

# Deploy
npm run deploy:rules:prod

# החזר את ה-development rules
git checkout firebase/firestore.rules firebase/storage.rules
```

### שיטה 2: Script (מומלץ)

צור script `scripts/deploy-rules.sh`:

```bash
#!/bin/bash
ENV=$1

if [ "$ENV" = "prod" ]; then
  echo "Deploying PRODUCTION rules..."
  cp firebase/firestore.rules.prod firebase/firestore.rules
  cp firebase/storage.rules.prod firebase/storage.rules
  firebase use prod
  firebase deploy --only firestore:rules,storage:rules
  git checkout firebase/firestore.rules firebase/storage.rules
else
  echo "Deploying INTEGRATION rules..."
  firebase use intgr
  firebase deploy --only firestore:rules,storage:rules
fi
```

### שיטה 3: CI/CD (אידיאלי)

בגיטהאב אקשנס או CI אחר:

```yaml
# .github/workflows/deploy-rules.yml
name: Deploy Firebase Rules

on:
  push:
    branches: [main]
    paths:
      - 'firebase/**'

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g firebase-tools
      - run: |
          cp firebase/firestore.rules.prod firebase/firestore.rules
          cp firebase/storage.rules.prod firebase/storage.rules
          firebase use prod
          firebase deploy --only firestore:rules,storage:rules
```

## המלצות

1. **לפיתוח מקומי**: השתמש ב-development rules
2. **ל-Integration**: השתמש ב-development rules (יותר גמיש לבדיקות)
3. **ל-Production**: השתמש ב-production rules (יותר בטוח)

## Cloud Functions Alternative

ב-production, מומלץ להשתמש ב-Cloud Functions לבדיקת username availability:

```typescript
// functions/src/checkUsername.ts
export const checkUsername = functions.https.onCall(async (data, context) => {
  const { username } = data;
  
  if (!username || username.length < 3 || username.length > 20) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid username');
  }
  
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.where('username', '==', username.toLowerCase()).get();
  
  return { available: snapshot.empty };
});
```

אז ב-rules, תוכל להסיר את `allow read: if true` לחלוטין.

