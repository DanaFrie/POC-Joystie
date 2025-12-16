# Cloud Run Service - Graph Telemetry Processor

This is a Cloud Run service that processes screenshots and extracts screen time data using the Python graph telemetry service.

## Quick Start

1. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy process-screenshot \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 1Gi \
     --set-env-vars GOOGLE_API_KEY=your-api-key
   ```

2. **Get the service URL** and update Firebase Function

3. **Test:**
   ```bash
   curl https://your-service-url/health
   ```

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

- `Dockerfile` - Container definition
- `main.py` - Flask service entry point
- `requirements.txt` - Flask dependencies
- `.dockerignore` - Files to exclude from build

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

