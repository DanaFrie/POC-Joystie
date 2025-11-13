# Firebase Setup & Environment Guide

## Overview

הפרויקט תומך בשתי סביבות:
- **Integration (intgr)**: סביבת פיתוח ובדיקות
- **Production (prod)**: סביבת ייצור

## Firebase Projects

1. **Integration**: `joystie-poc-intgr`
2. **Production**: `joystie-poc-prod`

## Step 1: Create Firebase Projects

### Integration Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `joystie-poc-intgr`
4. Disable Google Analytics (optional for POC)
5. Click "Create project"

### Production Project
1. Repeat the same steps with project name: `joystie-poc-prod`

## Step 2: Enable Authentication

For each project (intgr and prod):
1. In Firebase Console, go to **Authentication** → **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

## Step 3: Create Firestore Database

For each project:
1. Go to **Firestore Database** → **Create database**
2. Select **Start in test mode** (we'll deploy security rules later)
3. Choose a location (e.g., `us-central1` or closest to your users)
4. Click **Enable**

## Step 4: Enable Cloud Storage (Optional)

For each project:
1. Go to **Storage** → **Get started**
2. Select **Start in test mode**
3. Choose location: **us-central1** (recommended for free tier)
4. Click **Done**

**Note**: Storage can be set up later - it's not critical for initial setup.

## Step 5: Get Firebase Configuration

For each project:
1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app with name: "Joystie Web"
5. Copy the `firebaseConfig` object values

## Step 6: Configure Environment Variables

### Integration Environment (Development)

1. העתק את `.env.intgr.example` ל-`.env.local`
2. מלא את הערכים מ-Firebase Console של `joystie-poc-intgr`

```bash
cp .env.intgr.example .env.local
# ערוך .env.local עם הערכים מ-Firebase Console
```

### Production Environment

1. העתק את `.env.prod.example` ל-`.env.production.local`
2. מלא את הערכים מ-Firebase Console של `joystie-poc-prod`

```bash
cp .env.prod.example .env.production.local
# ערוך .env.production.local עם הערכים מ-Firebase Console
```

## Firebase CLI Commands

### Switch Between Projects

```bash
# עבור ל-Integration
npm run firebase:use:intgr

# עבור ל-Production
npm run firebase:use:prod
```

### Deploy Rules

```bash
# Deploy rules to Integration
npm run deploy:rules:intgr

# Deploy rules to Production
npm run deploy:rules:prod
```

### Deploy Everything

```bash
# Deploy all to Integration
npm run deploy:all:intgr

# Deploy all to Production
npm run deploy:all:prod
```

## Development Workflow

1. **Local Development**: השתמש ב-`.env.local` עם ערכי Integration
2. **Testing**: בדוק ב-Integration environment
3. **Production**: פרוס ל-Production רק אחרי בדיקות מלאות

## Important Notes

- `.env.local` - לא נשמר ב-Git (ב-`.gitignore`)
- `.env.production.local` - לא נשמר ב-Git (ב-`.gitignore`)
- הקבצים `.env.*.example` - נשמרים ב-Git כטמפלייטים

## Step 7: Deploy Security Rules

After setting up your Firebase projects, deploy the security rules:

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules to Integration
npm run deploy:rules:intgr

# Deploy rules to Production (after testing)
npm run deploy:rules:prod
```

The security rules are located in:
- `firebase/firestore.rules` - Firestore security rules (for development/intgr)
- `firebase/firestore.rules.prod` - Firestore security rules (for production)
- `firebase/storage.rules` - Cloud Storage security rules (for development/intgr)
- `firebase/storage.rules.prod` - Cloud Storage security rules (for production)
- `firebase/firestore.indexes.json` - Firestore indexes

### Production Rules

**Important**: For production, use the `.prod` versions of the rules files:
- `firebase/firestore.rules.prod` - Stricter rules with validation
- `firebase/storage.rules.prod` - Enhanced file type validation

**Key differences in production rules:**
1. **Users collection**: 
   - No public read access (requires authentication)
   - Username availability checks should use Cloud Functions
   - Email validation on create
   - Username length validation (3-20 characters)

2. **Storage**:
   - Stricter file type validation (only jpeg, jpg, png, webp)
   - Filename pattern validation
   - Explicit delete permissions

**To deploy production rules:**
```bash
# Copy production rules to main files before deploying
cp firebase/firestore.rules.prod firebase/firestore.rules
cp firebase/storage.rules.prod firebase/storage.rules

# Deploy to production
npm run deploy:rules:prod

# Restore development rules for local work
git checkout firebase/firestore.rules firebase/storage.rules
```

**Or use a deployment script** (recommended):
```bash
# Create a script that switches rules based on environment
# See DEPLOYMENT.md for details
```

## Current Default

הפרויקט מוגדר כברירת מחדל ל-Integration (`joystie-poc-intgr`).

## Project Structure

כל הקבצים הקשורים ל-Firebase מאורגנים כך:

```
firebase/
  ├── firestore.rules          # Firestore security rules
  ├── storage.rules            # Cloud Storage security rules
  └── firestore.indexes.json   # Firestore indexes

src/
  ├── lib/
  │   ├── firebase.ts          # Firebase initialization
  │   └── api/                 # Firebase API functions
  │       ├── users.ts
  │       ├── challenges.ts
  │       ├── children.ts
  │       ├── uploads.ts
  │       ├── notifications.ts
  │       └── storage.ts
  ├── utils/
  │   └── auth.ts              # Firebase Auth utilities
  └── types/
      └── firestore.ts         # Firestore type definitions

Root:
  ├── firebase.json            # Firebase CLI configuration
  ├── .firebaserc              # Firebase project aliases
  └── .env.local               # Environment variables (not in Git)
```

