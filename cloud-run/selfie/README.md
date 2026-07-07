# Cloud Run — Selfie Blending Service

AI selfie compose: child + parent face crops + genders → Gemini image model → PNG (castle + Dori background).

**Separate from `process-screenshot`** — own image, service name, and Firebase secret.

## Deploy (integration `joystie-poc`)

From repo root:

```bash
gcloud builds submit --config cloud-run/selfie/cloudbuild.yaml \
  --substitutions _IMAGE_NAME=us-central1-docker.pkg.dev/joystie-poc/cloud-run-source-deploy/generate-selfie \
  --project joystie-poc

gcloud run deploy generate-selfie \
  --image us-central1-docker.pkg.dev/joystie-poc/cloud-run-source-deploy/generate-selfie \
  --platform managed --region us-central1 --allow-unauthenticated \
  --memory 2Gi --timeout 540 --cpu 2 \
  --set-secrets GOOGLE_API_KEY=GOOGLE_API_KEY:latest \
  --project joystie-poc

gcloud run services describe generate-selfie --region us-central1 --project joystie-poc --format="value(status.url)"
```

Set Firebase secret (new — does **not** replace `CLOUD_RUN_SERVICE_URL`):

```bash
firebase use intgr
firebase functions:secrets:set CLOUD_RUN_SELFIE_SERVICE_URL
# paste generate-selfie Cloud Run URL (no trailing slash)
firebase deploy --only functions:generateSelfie
```

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `GOOGLE_API_KEY` | yes | Same Gemini key as screenshot service |
| `BACKGROUND_IMAGE_PATH` | no | Bundled in image at `/app/assets/castle-dori-selfie.webp` |
| `ASSETS_BUCKET_NAME` | no | Optional GCS override for background |
| `SELFIE_MODEL_NAME` | no | Default `gemini-3.1-flash-image` |
| `CORS_ALLOW_ORIGINS` | no | Comma-separated origins for browser direct calls (default `*`) |

## Local

```bash
docker build -f cloud-run/selfie/Dockerfile -t joystie-selfie .
docker run --rm -p 8081:8080 -e GOOGLE_API_KEY=your-key joystie-selfie
curl http://localhost:8081/health
```

Dev UI test: `/onboarding/child/selfie-generate-test` — same Mission 3 flow via Firebase `generateSelfie` (not a separate local service path).

## Endpoints

- `GET /health`
- `POST /generate-selfie` — multipart (`parent_image`, `child_image`, genders)
- `POST /generate-selfie-json` — JSON + base64 (Firebase callable or browser direct)

Output is **PNG bytes in the response** — not stored server-side.
