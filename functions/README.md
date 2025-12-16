# Firebase Functions for Joystie

This directory contains Firebase Cloud Functions for processing screenshots and extracting screen time data.

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Set environment variables:
```bash
firebase functions:config:set google.api_key="YOUR_GOOGLE_API_KEY"
```

Or use `.env` file for local development (not recommended for production).

## Local Testing

Run the emulator:
```bash
npm run serve
```

This will start the Firebase emulator with functions support.

## Deployment

Deploy to Firebase:
```bash
npm run deploy
```

## Function: processScreenshot

Processes a screenshot image and extracts screen time data for a specific day.

### Input:
```json
{
  "imageData": "base64_encoded_image",
  "targetDay": "ראשון"
}
```

### Output:
```json
{
  "success": true,
  "day": "ראשון",
  "minutes": 203.1,
  "found": true,
  "metadata": {
    "scale_min_per_px": 1.15,
    "max_val_y": 240.0
  }
}
```

## Python Dependencies

**⚠️ Important Note:** Firebase Functions Gen 2 with Node.js runtime does NOT include Python by default.

You have two options:

### Option 1: Use Cloud Run (Recommended)
Deploy the Python service as a Cloud Run service and call it from the Firebase Function. See `FIREBASE_FUNCTIONS_SETUP.md` for details.

### Option 2: Custom Runtime
Use a custom Docker runtime with Python installed (more complex).

The Python script requires:
- Python 3.11+
- opencv-python
- numpy
- google-generativeai
- Pillow

These need to be installed in the runtime environment.

## Notes

- The function uses Python 3 runtime available in Cloud Functions environment
- Make sure the Python script path is correct relative to the functions directory
- The function has a 9-minute timeout limit
- Memory is set to 1GB

