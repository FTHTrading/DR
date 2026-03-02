FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install CPU-only PyTorch first (avoids downloading ~3GB of CUDA libs)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

COPY src ./src
WORKDIR /app/src
CMD ["python", "main.py"]
