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
from PIL import Image
from pydantic import BaseModel, Field

MODEL_NAME = os.getenv("SELFIE_MODEL_NAME", "gemini-3.1-flash-image")
BACKGROUND_IMAGE_PATH = os.getenv(
    "BACKGROUND_IMAGE_PATH", "/app/assets/castle-dori-selfie.webp"
)
ASSETS_BUCKET_NAME = os.getenv("ASSETS_BUCKET_NAME", "")
BACKGROUND_BLOB_NAME = os.getenv("BACKGROUND_BLOB_NAME", "onboarding/child/castle-dori-selfie.webp")
# Framing — zoom 1 = full castle asset (no extra crop). Focus unused when zoom is 1.
BACKGROUND_ZOOM = 1.0
BACKGROUND_FOCUS_Y = 0.4
# Share UI headline band (~top 86–236 on 812) — keep faces/Dori below this fraction.
UI_HEADROOM_FRAC = 0.30
# Share agreement footer (change + CTAs) — keep figures above this bottom band.
UI_FOOTER_FRAC = 0.35

BACKGROUND_IMAGE: Optional[Image.Image] = None
DORI_REFERENCE: Optional[Image.Image] = None
genai_client: Optional[genai.Client] = None


def get_genai_client() -> genai.Client:
    global genai_client
    if genai_client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        genai_client = genai.Client(api_key=api_key) if api_key else genai.Client()
    return genai_client


def zoom_background(
    img: Image.Image,
    zoom: float = BACKGROUND_ZOOM,
    focus_y: float = BACKGROUND_FOCUS_Y,
) -> Image.Image:
    """Center-x crop zoomed into stairs/castle, then scale back to original size."""
    if zoom <= 1.0:
        return img
    width, height = img.size
    crop_w = max(1, int(round(width / zoom)))
    crop_h = max(1, int(round(height / zoom)))
    left = max(0, (width - crop_w) // 2)
    focus_y = min(1.0, max(0.0, focus_y))
    center_y = int(round(height * focus_y))
    top = max(0, min(height - crop_h, center_y - crop_h // 2))
    cropped = img.crop((left, top, left + crop_w, top + crop_h))
    return cropped.resize((width, height), Image.Resampling.LANCZOS)


def fit_cover(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Scale to cover target size, center-crop — never stretch (avoids skinny/narrow people)."""
    src_w, src_h = img.size
    if src_w <= 0 or src_h <= 0:
        raise ValueError("Invalid image size")
    scale = max(target_w / src_w, target_h / src_h)
    new_w = max(1, int(round(src_w * scale)))
    new_h = max(1, int(round(src_h * scale)))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = max(0, (new_w - target_w) // 2)
    top = max(0, (new_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def find_dori_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Locate standing Dori on the castle stairs (center-lower lime/yellow pixels)."""
    width, height = img.size
    pixels = img.load()
    x0, x1 = int(width * 0.2), int(width * 0.8)
    y0, y1 = int(height * 0.45), int(height * 0.92)
    xs: list[int] = []
    ys: list[int] = []
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = pixels[x, y][:3]
            lime = g > 170 and g > r + 40 and g > b + 40 and 40 < r < 220 and b < 160
            yellow = r > 180 and g > 160 and b < 120 and r > b + 40
            if lime or yellow:
                xs.append(x)
                ys.append(y)
    if not xs:
        return (
            int(width * 0.18),
            int(height * 0.45),
            int(width * 0.82),
            int(height * 0.93),
        )
    pad = max(8, int(0.02 * max(width, height)))
    return (
        max(0, min(xs) - pad),
        max(0, min(ys) - pad),
        min(width, max(xs) + pad),
        min(height, max(ys) + pad),
    )


def prepare_scene_and_dori(raw: Image.Image) -> tuple[Image.Image, Image.Image]:
    """
    Keep the castle background intact (erasing Dori was splitting the scene).
    Still crop Dori as a character reference for shoulder placement.
    """
    box = find_dori_bbox(raw)
    dori = raw.crop(box).convert("RGB")
    dori_side = max(dori.size)
    if dori_side < 384:
        scale = 384 / dori_side
        dori = dori.resize(
            (max(1, int(dori.size[0] * scale)), max(1, int(dori.size[1] * scale))),
            Image.Resampling.LANCZOS,
        )
    # Do NOT wipe Dori from the BG — crude fill broke stairs/castle continuity.
    zoomed = zoom_background(raw)
    print(f"Dori ref bbox={box}, crop={dori.size[0]}x{dori.size[1]} (BG kept intact)")
    return zoomed, dori


def load_raw_background() -> Image.Image:
    """Load castle background from bundled file or optional GCS bucket."""
    if os.path.isfile(BACKGROUND_IMAGE_PATH):
        print(f"Loading background from file: {BACKGROUND_IMAGE_PATH}")
        return Image.open(BACKGROUND_IMAGE_PATH).convert("RGB")

    if ASSETS_BUCKET_NAME:
        print(f"Loading background from gs://{ASSETS_BUCKET_NAME}/{BACKGROUND_BLOB_NAME}")
        try:
            from google.cloud import storage  # optional — not required for local file path
        except ImportError as exc:
            raise RuntimeError(
                "google-cloud-storage is required when ASSETS_BUCKET_NAME is set"
            ) from exc
        client = storage.Client()
        bucket = client.bucket(ASSETS_BUCKET_NAME)
        blob = bucket.blob(BACKGROUND_BLOB_NAME)
        img_bytes = blob.download_as_bytes()
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")

    raise RuntimeError(
        "Background asset missing — set BACKGROUND_IMAGE_PATH or ASSETS_BUCKET_NAME"
    )


def prepare_face_reference(img: Image.Image, min_side: int = 512) -> Image.Image:
    """Upscale small hole crops so the model gets more identity detail."""
    width, height = img.size
    scale = max(min_side / max(width, 1), min_side / max(height, 1), 1.0)
    if scale <= 1.0:
        return img
    return img.resize(
        (max(1, int(round(width * scale))), max(1, int(round(height * scale)))),
        Image.Resampling.LANCZOS,
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
    headroom_pct = int(round(UI_HEADROOM_FRAC * 100))
    footer_pct = int(round(UI_FOOTER_FRAC * 100))
    return (
        f"Tall phone portrait. Keep the castle background continuous and unbroken — "
        "same stairs-to-castle scene as the background image; no horizontal seam, "
        "no floating castle, no split layers. "
        f"LAYOUT (camera view): {parent} on the LEFT, {child} on the RIGHT — do not swap. "
        f"{parent} kneels on the left; {child} age 8–12 stands on the right; both look at camera. "
        "CLOTHES: modern casual everyday wear only — t-shirt/jeans/sneakers. "
        "Forbidden: medieval, fantasy costumes. "
        "FACES: exact face-swap from the parent/child photos — photoreal, no avatar. "
        "Parent face: keep natural adult proportions from the source photo — "
        "do not enlarge eyes, mouth, smile, jaw, or cheeks; no stretched or bobblehead look. "
        "Natural head-to-body scale for both. "
        f"Dori: move the background's green dragon piggyback ONLY onto the {child}'s shoulders. "
        f"Exactly one Dori — remove the standing Dori from empty stairs. Not on the {parent}. "
        f"COMPOSITION: top {headroom_pct}% sky/castle only; bottom {footer_pct}% empty stairs/path; "
        "people+Dori fully on mid stairs. Show full bodies including feet/sneakers — "
        "do not crop or cut off legs, knees, or shoes. "
        f"FEET: keep the {child}'s feet centered on the stair tread, well inside the step — "
        "not on the outer edge, margin, or corner of the stairs; leave clear stone margin "
        "between sneakers and the side of the path. "
        "LIGHTING: match the figures to the sunny castle light — same warm sunlight direction, "
        "highlights, and soft ground shadows as the background; do not leave people looking "
        "flat, cool, or pasted-on. "
        "NO UI in the image (no footer/menu/buttons/text bars). Clean photo only. "
        "Do not squash people."
    )


def run_generation(
    parent_gender: str,
    child_gender: str,
    parent_bytes: bytes,
    child_bytes: bytes,
) -> bytes:
    if BACKGROUND_IMAGE is None or DORI_REFERENCE is None:
        raise HTTPException(status_code=500, detail="Background asset not initialized.")

    bg_width, bg_height = BACKGROUND_IMAGE.size
    parent_img = prepare_face_reference(Image.open(io.BytesIO(parent_bytes)).convert("RGB"))
    child_img = prepare_face_reference(Image.open(io.BytesIO(child_bytes)).convert("RGB"))
    prompt = build_dynamic_prompt(parent_gender, child_gender)

    client = get_genai_client()
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            "Castle background — keep this scene continuous and unbroken:",
            BACKGROUND_IMAGE,
            "Dori character look — place ONLY on the CHILD's shoulders (piggyback), never on the parent:",
            DORI_REFERENCE,
            "PARENT face (person on the LEFT) — copy exactly:",
            parent_img,
            "CHILD face (person on the RIGHT) — copy exactly:",
            child_img,
            prompt,
        ],
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

    generated_img = Image.open(io.BytesIO(raw_output_bytes)).convert("RGB")
    final_img = fit_cover(generated_img, bg_width, bg_height)
    print(
        f"Output fit_cover: src={generated_img.size[0]}x{generated_img.size[1]} "
        f"-> {bg_width}x{bg_height}"
    )

    output_buffer = io.BytesIO()
    final_img.save(output_buffer, format="PNG")
    return output_buffer.getvalue()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global BACKGROUND_IMAGE, DORI_REFERENCE
    raw = load_raw_background()
    BACKGROUND_IMAGE, DORI_REFERENCE = prepare_scene_and_dori(raw)
    print(
        f"Background cached: {BACKGROUND_IMAGE.size[0]}x{BACKGROUND_IMAGE.size[1]} "
        f"(Dori ref {DORI_REFERENCE.size[0]}x{DORI_REFERENCE.size[1]})"
    )
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
        "dori_reference_loaded": DORI_REFERENCE is not None,
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
