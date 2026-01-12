# Hướng dẫn chạy Ngrok để Public Website

Tài liệu này hướng dẫn bạn cách sử dụng Ngrok để đưa website đang chạy trên máy tính (localhost) ra internet để người khác (hoặc điện thoại) có thể truy cập.

## 1. Chuẩn bị

Đảm bảo bạn đã cài đặt các thư viện của dự án (Project này đã được cài sẵn ngrok):

```bash
npm install
```

## 2. Cấu hình Authtoken (Chỉ làm 1 lần đầu tiên)

Nếu bạn chưa nhập token bao giờ, hãy làm như sau:

1.  Đăng ký/Đăng nhập tại [dashboard.ngrok.com](https://dashboard.ngrok.com).
2.  Vào mục **Your Authtoken** và copy mã token (bắt đầu bằng `2...`).
3.  Mở Terminal trong dự án và chạy lệnh sau (thay `TOKEN_CUA_BAN` bằng mã vừa copy):

```bash
npx ngrok config add-authtoken TOKEN_CUA_BAN
```

## 3. Chạy Ngrok

Để public website, bạn cần chạy 2 cửa sổ Terminal song song:

**Bước 1: Chạy Website (Terminal 1)**
Đảm bảo website đang chạy:
```bash
npm run dev
```
*(Chờ đến khi thấy hiện `Local: http://localhost:5173`)*

**Bước 2: Chạy Ngrok (Terminal 2)**
Mở một Terminal khác và chạy:
```bash
npx ngrok http 5173
```

## 4. Kết quả

Sau khi chạy lệnh ở Bước 2, màn hình sẽ hiện ra bảng thông tin, bạn tìm dòng **Forwarding**.

Ví dụ: `https://abcd-1234.ngrok-free.app -> http://localhost:5173`

👉 Copy link `https://...` đó và gửi cho người khác hoặc mở trên điện thoại để kiểm tra.

## Lưu ý

-   Khi bạn tắt cửa sổ Terminal chạy ngrok, link sẽ mất hiệu lực.
-   Mỗi lần chạy lại ngrok sẽ sinh ra một link mới (trừ khi bạn dùng bản trả phí).
