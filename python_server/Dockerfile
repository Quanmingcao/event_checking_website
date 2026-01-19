# Sử dụng Python 3.9 (Ổn định nhất cho InsightFace)
FROM python:3.9-slim

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV và InsightFace
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-6 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Tạo thư mục cho model để tránh lỗi phân quyền (Quan trọng trên HF Spaces)
RUN mkdir -p /root/.insightface/models

# Copy file requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào
COPY . .

# Mở cổng 7860 (Hugging Face Spaces bắt buộc dùng cổng này)
EXPOSE 7860

# Lệnh chạy server
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:7860", "--timeout", "120", "--workers", "1"]
