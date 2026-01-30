# Công Nghệ & Hạ Tầng Dự Án (Tech Stack)

Dưới đây là chi tiết các công nghệ và dịch vụ được sử dụng để phát triển và triển khai hệ thống **Event Check-in**:

## 1. Frontend (Giao diện người dùng)
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Tốc độ build và hot-reload cực nhanh).
*   **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) (Đảm bảo code chặt chẽ, ít lỗi).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Thiết kế giao diện hiện đại, responsive).
*   **Icon**: [Lucide React](https://lucide.dev/).
*   **Quản lý trạng thái**: React Hooks & Context API.

## 2. Backend & AI (Xử lý thông minh)
*   **Ngôn ngữ**: [Python 3.10+](https://www.python.org/).
*   **Web Framework**: [Flask](https://flask.palletsprojects.com/) (Nhẹ nhàng, hiệu quả cho API).
*   **AI Model**: [InsightFace](https://insightface.ai/) (Sử dụng model `buffalo_l` - Model có độ chính xác cao nhất trong bộ Buffalo để nhận diện và trích xuất đặc trưng khuôn mặt).
*   **Xử lý ảnh**: OpenCV & ONNX Runtime (Tối ưu hóa chạy model trên CPU).

## 3. Database & Backend-as-a-Service
*   **Nền tảng**: [Supabase](https://supabase.com/).
*   **Cơ sở dữ liệu**: [PostgreSQL](https://www.postgresql.org/) (Lưu trữ thông tin sự kiện, khách mời).
*   **Storage**: Supabase Storage (Lưu trữ ảnh avatar khách mời và ảnh nền sự kiện).
*   **Realtime**: [Supabase Realtime](https://supabase.com/docs/guides/realtime) (Tự động cập nhật màn hình Monitor ngay khi có người check-in mà không cần tải lại trang).
*   **Automation**: `pg_cron` (Dùng để chạy các job tự động dọn dẹp dữ liệu cũ).

## 4. Triển khai & Hạ tầng (Deployment)
*   **Frontend**: [Vercel](https://vercel.com/) (Tự động deploy từ GitHub, hỗ trợ Edge Network).
*   **Backend AI**: [Hugging Face Spaces](https://huggingface.co/spaces) (Cung cấp 16GB RAM miễn phí, đủ để vận hành mô hình AI nặng).
*   **Containerization**: [Docker](https://www.docker.com/) (Đóng gói Backend Python để đảm bảo chạy ổn định trên mọi môi trường).
*   **Version Control**: [GitHub](https://github.com/).

## 5. Tiện ích khác
*   **Xuất báo cáo**: [XLSX](https://www.npmjs.com/package/xlsx) (Tạo file Excel báo cáo chuyên nghiệp).
*   **QR Code**: QR Server API (Tạo mã định danh cho khách mời).
*   **Quét QR**: `html5-qrcode`.

---
*Tài liệu này được tạo tự động để tóm tắt kiến trúc hệ thống của bạn.*
