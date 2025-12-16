# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python service files
COPY services/graph-telemetry/ /app/services/graph-telemetry/

# Install Python dependencies
RUN pip install --no-cache-dir -r services/graph-telemetry/requirements.txt

# Copy Cloud Run service code
COPY cloud-run/ /app/cloud-run/

# Set Python path
ENV PYTHONPATH=/app

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Run the service
CMD ["python", "-m", "cloud_run.main"]

