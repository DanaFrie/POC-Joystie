FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY cloud-run/selfie/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY cloud-run/selfie/main.py /app/main.py
COPY public/onboarding/child/castle-dori-selfie.webp /app/assets/castle-dori-selfie.webp

ENV BACKGROUND_IMAGE_PATH=/app/assets/castle-dori-selfie.webp
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
