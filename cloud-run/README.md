# Cloud Run Service - Graph Telemetry Processor

This is a Cloud Run service that processes screenshots and extracts screen time data using the Python graph telemetry service.

## Quick Start

**Note:** All commands should be run from the **project root directory** (not from the `cloud-run/` directory).

### Production Deployment

1. **Build and deploy to Cloud Run (Production):**
   ```bash
   # Build the Docker image using cloudbuild.yaml
   gcloud builds submit --config cloud-run/cloudbuild.yaml --substitutions _IMAGE_NAME=us-central1-docker.pkg.dev/joystie-poc-prod/cloud-run-source-deploy/process-screenshot --project joystie-poc-prod .
   
   # Deploy to Cloud Run
   gcloud run deploy process-screenshot --image us-central1-docker.pkg.dev/joystie-poc-prod/cloud-run-source-deploy/process-screenshot --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --set-env-vars GOOGLE_API_KEY=google-api-key --project joystie-poc-prod
   ```

2. **Get the service URL:**
   ```bash
   gcloud run services describe process-screenshot --region us-central1 --project joystie-poc-prod --format="value(status.url)"
   ```

3. **Update Firebase Functions secret:**
   ```bash
   firebase use prod
   firebase functions:secrets:set CLOUD_RUN_SERVICE_URL
   # Enter the service URL from step 2
   ```

4. **Deploy Firebase Functions:**
   ```bash
   firebase deploy --only functions:screenshotProcess
   ```

5. **Test:**
   ```bash
   curl https://your-service-url/health
   ```

### Integration Deployment

For integration environment, use the same commands but with:
- Project: `joystie-poc`
- Image name: `us-central1-docker.pkg.dev/joystie-poc/cloud-run-source-deploy/process-screenshot`
- Service name: `process-screenshot`

## Local Development

```bash
# Build Docker image
docker build -t graph-telemetry -f cloud-run/Dockerfile ..

# Run locally
docker run -p 8080:8080 -e GOOGLE_API_KEY=your-key graph-telemetry

# Test
curl http://localhost:8080/health
```

## Files

- `Dockerfile` - Container definition (uses `cloud-run/Dockerfile` from project root)
- `cloudbuild.yaml` - Cloud Build configuration for building the Docker image
- `main.py` - Flask service entry point
- `requirements.txt` - Flask dependencies (located in `services/graph-telemetry/requirements.txt`)
- `.dockerignore` - Files to exclude from build

**Note:** The `cloudbuild.yaml` file is required for building the Docker image. It specifies the Dockerfile path (`cloud-run/Dockerfile`) and allows building from the project root directory.

## Environment Variables

- `GOOGLE_API_KEY` - Google Gemini API key (required)
- `PORT` - Server port (default: 8080, set by Cloud Run)

## API Endpoints

### POST `/`
Process screenshot and extract screen time data.

**Request:**
```json
{
  "data": {
    "imageData": "base64_encoded_image",
    "targetDay": "ראשון"
  }
}
```

**Response:**
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

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "graph-telemetry-processor",
  "python_version": "3.11.x"
}
```

