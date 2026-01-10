# Use Python 3.9 as the base image
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Install system dependencies
# libgomp1: for scikit-learn/torch
# libgl1: generic OpenGL support for image libs
# libglib2.0-0: required by cv2/image processing
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set env vars for better logging and caching
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    MPLCONFIGDIR=/tmp/matplotlib \
    TRANSFORMERS_CACHE=/app/cache/transformers \
    TORCH_HOME=/app/cache/torch

# Create a non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Create cache directories with correct permissions
RUN mkdir -p /app/cache/transformers /app/cache/torch /app/data && \
    chmod -R 777 /app/cache /app/data

# Copy the requirements file
COPY --chown=user requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the application
COPY --chown=user . .

# Expose port
EXPOSE 7860

# Run with python -m to ensure path resolution
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
