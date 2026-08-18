# Cloud Run — Selfie Blending Service

AI selfie compose: child + parent face crops + genders → Gemini image model → PNG (castle + Dori background).

**Separate from `process-screenshot`** — own image, service name, and Firebase secret.

## Local loop (UI + service)

Iterate on `cloud-run/selfie/main.py` (prompt / resize / crop) without deploying.

### 1. Start the selfie service

Needs **64-bit** Python 3.11+ (`py -0p`). Uses `requirements-local.txt` (wheels; no GCS compile).

```powershell
$env:GOOGLE_API_KEY = "your-gemini-key"
npm run selfie:service
```

- Listens on `http://127.0.0.1:8081`
- Uses `uvicorn --reload` — edits to `main.py` hot-reload
- Background: `public/onboarding/child/castle-dori-selfie.webp`
- Health: `GET http://127.0.0.1:8081/health`

### 2. Point the Next.js app at local service

In `.env.local` (repo root):

```env
NEXT_PUBLIC_SELFIE_SERVICE_URL=http://127.0.0.1:8081
```

Restart `npm run dev` after changing env (Next inlines `NEXT_PUBLIC_*` at startup).

Unset / remove the var to go back to Firebase callable → deployed Cloud Run.

### 3. Open the test UI

```
http://localhost:3000/onboarding/child/selfie-generate-test
```

| Mode | Use |
|------|-----|
| **Mission UI** | Full pattern → camera → preparing → review → share |
| **API scratchpad** | Upload two face crops → generate (faster prompt/resize iteration) |

Banner shows `local service` when the env override is active.

### Flow

```
Browser → POST /generate-selfie-json (local :8081) → Gemini → PNG blob → review UI
```

No Firebase callable in the local path.

---

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

## Docker (optional local)

```bash
docker build -f cloud-run/selfie/Dockerfile -t joystie-selfie .
docker run --rm -p 8081:8080 -e GOOGLE_API_KEY=your-key joystie-selfie
curl http://localhost:8081/health
```

Prefer `npm run selfie:service` for prompt iteration (no rebuild per edit).

## Endpoints

- `GET /health`
- `POST /generate-selfie` — multipart (`parent_image`, `child_image`, genders)
- `POST /generate-selfie-json` — JSON + base64 (Firebase callable or browser direct)

Output is **PNG bytes in the response** — not stored server-side.
