"""
Cloud Run — AI selfie blending (castle + Dori background, Gemini image model).
Separate from graph-telemetry / process-screenshot.
"""
import base64
import io
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from google import genai
from google.cloud import storage
from PIL import Image
from pydantic import BaseModel, Field

MODEL_NAME = os.getenv("SELFIE_MODEL_NAME", "gemini-3.1-flash-image")
BACKGROUND_IMAGE_PATH = os.getenv(
    "BACKGROUND_IMAGE_PATH", "/app/assets/castle-dori-selfie.webp"
)
ASSETS_BUCKET_NAME = os.getenv("ASSETS_BUCKET_NAME", "")
BACKGROUND_BLOB_NAME = os.getenv("BACKGROUND_BLOB_NAME", "onboarding/child/castle-dori-selfie.webp")

BACKGROUND_IMAGE: Optional[Image.Image] = None
genai_client: Optional[genai.Client] = None


def get_genai_client() -> genai.Client:
    global genai_client
    if genai_client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        genai_client = genai.Client(api_key=api_key) if api_key else genai.Client()
    return genai_client


def load_background_image() -> Image.Image:
    """Load castle background from bundled file or optional GCS bucket."""
    if os.path.isfile(BACKGROUND_IMAGE_PATH):
        print(f"Loading background from file: {BACKGROUND_IMAGE_PATH}")
        return Image.open(BACKGROUND_IMAGE_PATH).convert("RGB")

    if ASSETS_BUCKET_NAME:
        print(f"Loading background from gs://{ASSETS_BUCKET_NAME}/{BACKGROUND_BLOB_NAME}")
        client = storage.Client()
        bucket = client.bucket(ASSETS_BUCKET_NAME)
        blob = bucket.blob(BACKGROUND_BLOB_NAME)
        img_bytes = blob.download_as_bytes()
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")

    raise RuntimeError(
        "Background asset missing — set BACKGROUND_IMAGE_PATH or ASSETS_BUCKET_NAME"
    )


def build_dynamic_prompt(parent_gender: str, child_gender: str) -> str:
    parent = (
        "mother"
        if parent_gender.lower() in ["female", "woman", "mother", "girl", "f"]
        else "father"
    )
    child = (
        "daughter"
        if child_gender.lower() in ["female", "woman", "daughter", "girl", "f"]
        else "son"
    )
    return (
        f"Full-body blend of {parent} and {child} in the middle of the stairs: "
        f"{parent} kneeling, {child} standing, looking at the camera. "
        f"Faces must be 100% photorealistic and natural, not cartoon/avatar style. "
        f"Place the single green dragon on {child}'s shoulders. Match lighting."
    )


def run_generation(
    parent_gender: str,
    child_gender: str,
    parent_bytes: bytes,
    child_bytes: bytes,
) -> bytes:
    if BACKGROUND_IMAGE is None:
        raise HTTPException(status_code=500, detail="Background asset not initialized.")

    bg_width, bg_height = BACKGROUND_IMAGE.size
    parent_img = Image.open(io.BytesIO(parent_bytes)).convert("RGB")
    child_img = Image.open(io.BytesIO(child_bytes)).convert("RGB")
    prompt = build_dynamic_prompt(parent_gender, child_gender)

    client = get_genai_client()
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[BACKGROUND_IMAGE, parent_img, child_img, prompt],
    )

    raw_output_bytes = None
    parts = getattr(response, "parts", None)
    if parts:
        for part in parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                raw_output_bytes = inline.data
                break

    if not raw_output_bytes and response.candidates:
        for part in response.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                raw_output_bytes = inline.data
                break

    if not raw_output_bytes:
        raise HTTPException(status_code=502, detail="Model did not return valid image data.")

    generated_img = Image.open(io.BytesIO(raw_output_bytes))
    final_img = generated_img.resize((bg_width, bg_height), Image.Resampling.LANCZOS)

    output_buffer = io.BytesIO()
    final_img.save(output_buffer, format="PNG")
    return output_buffer.getvalue()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global BACKGROUND_IMAGE
    BACKGROUND_IMAGE = load_background_image()
    print(f"Background cached: {BACKGROUND_IMAGE.size[0]}x{BACKGROUND_IMAGE.size[1]}")
    yield


app = FastAPI(title="AI Selfie Blending Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class GenerateSelfieJsonBody(BaseModel):
    parent_gender: str = Field(..., description="female | male")
    child_gender: str = Field(..., description="female | male")
    parent_image_base64: str
    child_image_base64: str


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "selfie-blending",
        "background_loaded": BACKGROUND_IMAGE is not None,
        "model": MODEL_NAME,
    }


@app.post("/generate-selfie")
async def generate_selfie_multipart(
    parent_gender: str = Form(...),
    child_gender: str = Form(...),
    parent_image: UploadFile = File(...),
    child_image: UploadFile = File(...),
):
    try:
        parent_bytes = await parent_image.read()
        child_bytes = await child_image.read()
        png_bytes = run_generation(parent_gender, child_gender, parent_bytes, child_bytes)
        return Response(content=png_bytes, media_type="image/png")
    except HTTPException:
        raise
    except Exception as exc:
        print(f"generate-selfie error: {exc}")
        raise HTTPException(status_code=500, detail=f"Generation pipeline failed: {exc}") from exc


@app.post("/generate-selfie-json")
async def generate_selfie_json(body: GenerateSelfieJsonBody):
    """JSON + base64 — used by Firebase callable proxy."""
    try:
        parent_bytes = base64.b64decode(body.parent_image_base64)
        child_bytes = base64.b64decode(body.child_image_base64)
        png_bytes = run_generation(
            body.parent_gender, body.child_gender, parent_bytes, child_bytes
        )
        return {
            "success": True,
            "imageData": base64.b64encode(png_bytes).decode("ascii"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        print(f"generate-selfie-json error: {exc}")
        raise HTTPException(status_code=500, detail=f"Generation pipeline failed: {exc}") from exc
