# Firebase Functions Setup Guide

This guide explains how to set up and deploy the Firebase Functions for processing screenshots.

## Architecture

The function uses **Firebase Functions Gen 2** with **Node.js runtime** that executes a Python script. However, Firebase Functions Gen 2 doesn't include Python by default, so we have two options:

### Option 1: Cloud Run with Python (Recommended)

Deploy the Python service as a Cloud Run service and call it from a Firebase Function.

### Option 2: Use Node.js Only (Alternative)

Convert the Python logic to Node.js (requires rewriting the image processing code).

## Current Implementation

The current implementation uses **Option 1** - a Node.js Firebase Function that calls a Cloud Run service running Python.

## Setup Steps

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Set Environment Variables

Set the Google API key:
```bash
firebase functions:config:set google.api_key="YOUR_GOOGLE_API_KEY"
```

Or for Gen 2 functions, use:
```bash
firebase functions:secrets:set GOOGLE_API_KEY
```

### 4. Deploy Cloud Run Service (Python)

First, deploy the Python service to Cloud Run:

```bash
# Build and deploy to Cloud Run
gcloud run deploy process-screenshot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=YOUR_API_KEY
```

### 5. Update Function with Cloud Run URL

Update `functions/src/index.ts` with your Cloud Run service URL.

### 6. Deploy Firebase Function

```bash
npm run deploy
```

## Local Testing

### Using Firebase Emulator

```bash
# Install emulator
firebase init emulators

# Run emulator
firebase emulators:start --only functions
```

### Testing the Function

```javascript
const functions = require('firebase-functions-test')();
const processScreenshot = require('./lib/index').processScreenshot;

// Test data
const testData = {
  imageData: 'base64_encoded_image_here',
  targetDay: 'ראשון'
};

// Call function
processScreenshot(testData, { auth: { uid: 'test-user' } })
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

## Alternative: Direct Python Execution

If you want to run Python directly in Firebase Functions, you'll need to:

1. Use a custom runtime with Python installed
2. Or use Cloud Build to create a custom container

This is more complex and not recommended for this use case.

## Troubleshooting

### Python Not Found

If you get "Python not found" errors:
- Make sure Python 3 is installed in the Cloud Functions environment
- For Gen 2, you may need to use a custom runtime

### Import Errors

If you get import errors for Python packages:
- Make sure all dependencies are listed in `services/graph-telemetry/requirements.txt`
- The packages need to be installed in the Cloud Functions environment

### Timeout Issues

The function has a 9-minute timeout. If processing takes longer:
- Optimize the Python script
- Increase timeout in function configuration
- Consider using Cloud Run with longer timeout

## Production Considerations

1. **Security**: Use Firebase Functions secrets for API keys
2. **Performance**: Consider caching results
3. **Error Handling**: Add retry logic for transient failures
4. **Monitoring**: Set up Cloud Monitoring alerts
5. **Cost**: Monitor Cloud Run and Functions usage

