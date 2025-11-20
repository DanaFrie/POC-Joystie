# Cloud Run Setup Guide - Graph Telemetry Service

This guide will help you set up the Cloud Run service for processing screenshots. **Cloud Run has a generous free tier!**

## 💰 Pricing & Free Tier

**Cloud Run Free Tier (Always Free):**
- **2 million requests per month** (free)
- **360,000 GB-seconds** of memory (free)
- **180,000 vCPU-seconds** (free)
- After free tier: Pay only for what you use (very affordable)

**For this service:**
- Each request uses ~1GB memory for ~10-30 seconds
- You can process **thousands of screenshots per month for FREE**
- Even after free tier: ~$0.000024 per request (very cheap!)

## 📋 Prerequisites

1. **Google Cloud Account** (free to create)
2. **Google Cloud Project** (free to create)
3. **gcloud CLI** installed (see below)
4. **Docker** (optional, for local testing)

## 🚀 Step-by-Step Setup

### Step 1: Install Google Cloud SDK

**Windows:**
```powershell
# Download and install from:
# https://cloud.google.com/sdk/docs/install

# Or use Chocolatey:
choco install gcloudsdk
```

**Mac:**
```bash
# Using Homebrew
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
# Download script
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Initialize gcloud

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create joystie-poc --name="Joystie POC"

# Set as current project
gcloud config set project joystie-poc

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step 3: Set Up Authentication

```bash
# Set up Application Default Credentials
gcloud auth application-default login

# Verify
gcloud auth list
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root (or set in Cloud Run):

```bash
# Set Google API Key
gcloud run services update process-screenshot \
  --set-env-vars GOOGLE_API_KEY=your-api-key-here \
  --region us-central1
```

Or use Secret Manager (recommended for production):

```bash
# Create secret
echo -n "your-api-key-here" | gcloud secrets create google-api-key --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding google-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: Build and Deploy

**From project root directory:**

```bash
# Build and deploy to Cloud Run
gcloud run deploy process-screenshot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 540 \
  --max-instances 10 \
  --set-env-vars GOOGLE_API_KEY=your-api-key-here
```

**What this does:**
- `--source .` - Builds from current directory using Dockerfile
- `--platform managed` - Fully managed Cloud Run
- `--region us-central1` - Choose your region
- `--allow-unauthenticated` - Allow public access (or use `--no-allow-unauthenticated` for private)
- `--memory 1Gi` - 1GB RAM (enough for image processing)
- `--timeout 540` - 9 minutes max (for long processing)
- `--max-instances 10` - Limit concurrent instances (cost control)

### Step 6: Get Service URL

After deployment, you'll get a URL like:
```
https://process-screenshot-XXXXX-uc.a.run.app
```

Save this URL - you'll need it for the Firebase Function.

### Step 7: Update Firebase Function

Update `functions/src/index.ts` with your Cloud Run URL:

```typescript
const cloudRunUrl = 'https://process-screenshot-XXXXX-uc.a.run.app';
```

Or use environment variable:
```bash
firebase functions:config:set cloud_run.url="https://process-screenshot-XXXXX-uc.a.run.app"
```

## 🧪 Testing Locally

### Option 1: Test with Docker

```bash
# Build image
docker build -t graph-telemetry -f cloud-run/Dockerfile .

# Run container
docker run -p 8080:8080 -e GOOGLE_API_KEY=your-key graph-telemetry

# Test
curl -X POST http://localhost:8080/health
```

### Option 2: Test with Cloud Run Emulator

```bash
# Install emulator
gcloud components install cloud-run-emulator

# Run locally
gcloud run services proxy process-screenshot --port=8080
```

## 📊 Monitoring

View logs:
```bash
gcloud run services logs read process-screenshot --region us-central1
```

View metrics:
```bash
# Open Cloud Console
https://console.cloud.google.com/run
```

## 🔒 Security Best Practices

1. **Use Secret Manager** for API keys (not environment variables)
2. **Enable authentication** if service is private
3. **Set up IAM** roles properly
4. **Monitor usage** to avoid unexpected costs

## 💡 Cost Optimization

1. **Set max instances** to limit concurrent requests
2. **Use appropriate memory** (1GB is usually enough)
3. **Monitor free tier** usage
4. **Set up billing alerts**

## 🐛 Troubleshooting

### Build fails
```bash
# Check Dockerfile syntax
docker build -t test -f cloud-run/Dockerfile .

# Check logs
gcloud builds list
gcloud builds log BUILD_ID
```

### Service won't start
```bash
# Check logs
gcloud run services logs read process-screenshot --region us-central1

# Check health endpoint
curl https://your-service-url/health
```

### Python import errors
- Make sure all dependencies are in `services/graph-telemetry/requirements.txt`
- Check Dockerfile copies files correctly

### Timeout errors
- Increase timeout: `--timeout 540`
- Optimize Python script
- Check for infinite loops

## 📝 Next Steps

1. Deploy Cloud Run service
2. Update Firebase Function with service URL
3. Deploy Firebase Function
4. Test end-to-end
5. Set up monitoring and alerts

## 🔗 Useful Links

- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Free Tier Details](https://cloud.google.com/free/docs/free-cloud-features#cloud-run)

