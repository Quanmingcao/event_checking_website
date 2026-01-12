# PROMPT: HƯỚNG DẪN SETUP NGROK CHO DỰ ÁN (V2)

> File này chứa hướng dẫn để AI (phiên bản v2) hoặc Developer thực hiện việc setup Ngrok, phục vụ cho việc test tính năng quét QR trên thiết bị di động.

---

## 1. Mục tiêu
Setup `ngrok` để expose localhost (Vite server đang chạy port `5173`) ra Internet, giúp các thiết bị di động (điện thoại của Staff) có thể truy cập Web App để test tính năng quét QR Code.

## 2. Các bước thực hiện (Dành cho AI/Dev)

### Bước 1: Kiểm tra cài đặt
Trong `package.json` đã có sẵn thư viện `ngrok` trong `devDependencies`.
Nếu chưa cài đặt, hãy chạy:
```bash
npm install -D ngrok
```
*Lưu ý: Có thể sử dụng bản ngrok cài sẵn trên máy (Global) nếu muốn.*

### Bước 2: Cấu hình Authtoken
Để ngrok hoạt động ổn định và không bị giới hạn thời gian session quá ngắn, cần cấu hình Authtoken.
1.  Truy cập dashboard: [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
2.  Copy Authtoken.
3.  Chạy lệnh sau trong terminal:
    ```bash
    npx ngrok config add-authtoken <YOUR_TOKEN_HERE>
    ```
    *(Nếu dùng bản global thì bỏ `npx`)*

### Bước 3: Khởi chạy Ngrok
Vì dự án Vite mặc định chạy trên port `5173`, hãy chạy lệnh sau để expose port này:

```bash
npx ngrok http 5173
```

### Bước 4: Lấy Public URL
Sau khi chạy thành công, terminal sẽ hiển thị giao diện của ngrok với dòng `Forwarding`.
Ví dụ: `Forwarding https://a1b2-14-232-212-11.ngrok-free.app -> http://localhost:5173`

Copy URL `https://...` này.

### Bước 5: Cập nhật Environment (Quan trọng)
1.  Dùng URL vừa copy để truy cập trên điện thoại.
2.  **Lưu ý về Supabase Auth:** Nếu tính năng Login Google/Facebook không hoạt động trên mobile, cần vào **Supabase Dashboard -> Authentication -> URL Configuration** và thêm URL ngrok mới vào danh sách **Redirect URLs**.

## 3. Lệnh tắt (Shortcut)
Có thể thêm script vào `package.json` để chạy nhanh:
```json
"scripts": {
  "tunnel": "ngrok http 5173"
}
```
Sau đó chỉ cần chạy: `npm run tunnel`

---
**Yêu cầu cho AI V2:**
Khi bắt đầu session làm việc, hãy hỏi User xem check-in qua điện thoại có cần thiết ngay không. Nếu có, hãy hướng dẫn User thực hiện các bước trên hoặc yêu cầu cung cấp Authtoken để setup giúp User.
