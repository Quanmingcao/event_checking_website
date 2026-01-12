# PROMPT KHỞI TẠO DỰ ÁN: EVENT CHECK-IN APP v2.0

> Copy toàn bộ nội dung dưới đây và gửi cho AI (như ChatGPT, Claude, Cursor) để bắt đầu xây dựng phiên bản 2.0 của dự án.

---

**Vai trò của bạn:** Bạn là một Senior Fullstack Developer & UI/UX Expert.
**Nhiệm vụ:** Xây dựng (hoặc nâng cấp) ứng dụng **Event Check-in Realtime** lên phiên bản 2.0 dựa trên hệ thống cốt lõi của phiên bản 1.0 dưới đây.

## 1. Tổng quan dự án (Context)
Xây dựng một Web App phục vụ check-in sự kiện với tốc độ cao, hoạt động realtime. Hệ thống phục vụ 3 nhóm đối tượng chính:
1.  **Admin:** Tạo sự kiện, quản lý danh sách khách mời (import từ Excel/CSV), theo dõi thống kê.
2.  **Staff:** Sử dụng điện thoại/tablet để quét QR Code trên vé mời để check-in cho khách (yêu cầu tốc độ cực nhanh, không cần đăng nhập phức tạp).
3.  **Monitor (Màn hình lớn):** Hiển thị realtime thông tin khách vừa check-in để chào mừng (Welcome screen).

## 2. Tech Stack (Yêu cầu kỹ thuật)
*   **Frontend:** React (Vite) + TypeScript.
*   **Styling:** Tailwind CSS (ưu tiên UI hiện đại, clean, hiệu ứng mượt mà).
*   **Backend/Database:** Supabase (Dùng PostgreSQL & Supabase Realtime).
*   **QR Scanning:** `html5-qrcode` (hoặc thư viện tương đương hiệu năng cao).
*   **State Management:** React Query (TanStack Query) hoặc Zustand (tùy chọn làm sao tối ưu realtime).
*   **Tiện ích:** `ngrok` (để expose localhost ra public cho thiết bị di động truy cập lúc test).

## 3. Database Schema (Cốt lõi - Giữ nguyên logic này)
Hệ thống dựa trên 3 bảng chính trong Supabase:

### Bảng `events`
*   `id` (uuid, primary key)
*   `event_code` (text, unique) - Mã sự kiện view trên URL
*   `name` (text) - Tên sự kiện
*   `start_time`, `end_time` (timestamp)
*   `organizer` (text), `location` (text), `image_url` (text)

### Bảng `attendants` (Khách mời)
*   `id` (uuid, primary key)
*   `event_id` (uuid, foreign key -> events.id)
*   `code` (text) - Mã khách mời (lấy từ MSSV hoặc mã vé), Unique theo Event.
*   `full_name` (text)
*   `position` (text) - Chức vụ
*   `organization` (text) - Đơn vị
*   `is_vip` (boolean)
*   `checked_in_at` (timestamp, nullable) - Thời gian check-in. NULL = chưa check-in.
*   `avatar_url` (text)
*   **Composite Unique:** `(event_id, code)` (Mã khách là duy nhất trong 1 sự kiện).

### Bảng `checkin_logs` (Lịch sử quét - Log)
*   `id` (bigint, primary key)
*   `event_id` (uuid)
*   `attendant_id` (uuid)
*   `checked_in_at` (timestamp) - Thời điểm log được tạo.

## 4. Các tính năng cốt lõi (Core Features)

### A. Quản lý sự kiện & Khách mời (Admin)
1.  **Dashboard:** Danh sách sự kiện.
2.  **Detail Event:** Xem thống kê (Tổng khách, Đã check-in, Chưa check-in).
3.  **Import Logic (Quan trọng):**
    *   Hỗ trợ upload CSV hoặc Paste Link Google Sheet (public).
    *   **Mapping cột (Bắt buộc):**
        *   `ma` -> `code`
        *   `ho_ten` -> `full_name`
        *   `chuc_vu` -> `position`
        *   `don_vi` -> `organization`
        *   `la_vip` -> `is_vip` (chấp nhận: true/false/1/0/có/không)
        *   `anh_dai_dien` -> `avatar_url`
    *   Xử lý trùng lặp: Nếu `ma` (code) đã tồn tại trong event -> Cập nhật thông tin mới nhất.

### B. Màn hình Check-in (Client/Staff)
1.  Truy cập qua URL (ví dụ: `/checkin/:event_id`).
2.  Sử dụng Camera thiết bị để quét QR Code.
3.  **Logic Quét:**
    *   QR Code chỉ chứa chuỗi văn bản là `code` (mã khách).
    *   Hệ thống tìm `attendant` trong DB khớp với `code` VÀ `event_id` hiện tại.
    *   **Case 1: Tìm thấy & Chưa check-in:**
        *   Update `attendants.checked_in_at` = now().
        *   Insert vào `checkin_logs`.
        *   Hiển thị Popup XANH: "Check-in Thành Công" + Tên Khách.
    *   **Case 2: Tìm thấy & Đã check-in:**
        *   Hiển thị Popup VÀNG/CAM: "Đã Check-in Trước Đó" + Thời gian check-in cũ.
    *   **Case 3: Không tìm thấy:**
        *   Hiển thị Popup ĐỎ: "Không tìm thấy khách mời".

### C. Màn hình Welcome (Monitor Realtime)
1.  Truy cập qua URL (ví dụ: `/monitor/:event_id`).
2.  Lắng nghe sự kiện `INSERT` trên bảng `checkin_logs` (hoặc `UPDATE` trên `attendants`) thông qua Supabase Realtime.
3.  Ngay khi có người check-in, hiển thị Card chào mừng trên màn hình lớn.
    *   Hiển thị: Avatar (to đẹp), Tên (Cỡ chữ lớn), Chức vụ/Đơn vị.
    *   Nếu là VIP: Có hiệu ứng đặc biệt (Vàng/Lấp lánh).
4.  Có hiệu ứng xuất hiện trang trọng (Fade in / Slide up).
5.  Logic: Hiển thị người mới nhất. Có thể hiển thị danh sách 3-5 người gần nhất ở góc nhỏ.

## 5. Yêu cầu nâng cấp cho phiên bản 2.0 (v2.0 Goals)
*Phần này là gợi ý để cải thiện trải nghiệm người dùng:*
1.  **UI/UX Premium:** Sử dụng phong cách thiết kế hiện đại (Glassmorphism), Animation mượt mà khi chuyển cảnh. Monitor phải trông thật sự "Wow" cho sự kiện trang trọng.
2.  **Chế độ Offline:** Cho phép Staff check-in khi mất mạng (lưu vào localStorage), tự động sync lên Supabase khi có mạng.
3.  **Manual Check-in & Search:** Thêm ô tìm kiếm khách mời theo Tên/Mã để check-in thủ công nếu khách quên QR.
4.  **Bảo mật:** Thêm mã PIN đơn giản cho trang Admin/Check-in để tránh truy cập trái phép.
5.  **Export Report:** Xuất danh sách khách đã đi (kèm thời gian) ra Excel.

---
**HÃY BẮT ĐẦU:**
Hãy setup dự án mới, cài đặt các thư viện cần thiết và xây dựng cấu trúc thư mục rõ ràng.
