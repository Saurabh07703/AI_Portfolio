# Use Python 3.9 as the base image
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Create a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy the requirements file into the container
COPY --chown=user requirements.txt .

# Install the dependencies
# We explicitly add the CPU-only pytorch index here for clarity and safety
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the current directory contents into the container at /app
COPY --chown=user . .

# Expose port 7860 built-in for Hugging Face Spaces
EXPOSE 7860

# Run the command to start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
