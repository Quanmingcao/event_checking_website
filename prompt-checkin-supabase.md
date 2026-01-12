# PROMPT DỰ ÁN -- WEB APP CHECK-IN SỰ KIỆN (SUPABASE REALTIME)

## 1. Mục tiêu hệ thống

Xây dựng một Web App check-in sự kiện realtime: - Admin tạo & quản lý sự
kiện - Nhập danh sách khách mời từ Google Sheet / CSV - Staff quét QR để
điểm danh (không cần đăng nhập) - Màn hình monitor hiển thị realtime ai
vừa tới

Tối giản role, tối giản logic, ưu tiên ổn định & realtime.

------------------------------------------------------------------------

## 2. Công nghệ bắt buộc

-   Backend: Supabase
    -   PostgreSQL
    -   Supabase Realtime
-   Frontend: Web app (framework tự chọn)
-   QR scan: camera web
-   Realtime: subscribe bảng `checkin_logs`

------------------------------------------------------------------------

## 3. Database schema (đã có sẵn -- KHÔNG ĐỔI)

### events

-   id (uuid)
-   event_code (unique)
-   name
-   location
-   organizer
-   image_url
-   start_time
-   end_time
-   created_at

### attendants

-   id (uuid)
-   event_id
-   full_name
-   code
-   position
-   organization
-   avatar_url
-   is_vip
-   checked_in_at
-   created_at
-   unique(event_id, code)

### checkin_logs

-   id
-   event_id
-   attendant_id
-   checked_in_at

------------------------------------------------------------------------

## 4. Nhập dữ liệu attendants từ Google Sheet / CSV

### 4.1. Nguồn dữ liệu

-   Upload file CSV
-   Dán link Google Sheet (public hoặc export CSV)

### 4.2. Cấu trúc Sheet (TÊN CỘT TIẾNG VIỆT -- BẮT BUỘC)

    ma | ho_ten | chuc_vu | don_vi | la_vip | anh_dai_dien

### Mapping sang database

  Sheet (VN)     Database
  -------------- --------------
  ma             code
  ho_ten         full_name
  chuc_vu        position
  don_vi         organization
  la_vip         is_vip
  anh_dai_dien   avatar_url

Ghi chú: - `ma`: MSSV hoặc mã khách mời - `la_vip`: true / false / 1 / 0
/ có / không - `anh_dai_dien`: có thể để trống

### 4.3. Logic import

1.  Parse file hoặc fetch Google Sheet
2.  Validate:
    -   `ma` không rỗng
    -   `ho_ten` không rỗng
3.  Map sang schema DB
4.  Gắn `event_id`
5.  Batch insert vào `attendants`
6.  Nếu trùng `ma` trong cùng event:
    -   Bỏ qua hoặc update (configurable)

### 4.4. UI Import (Admin)

-   Upload CSV hoặc dán link Sheet
-   Preview dữ liệu
-   Hiển thị tổng số dòng, số hợp lệ, số lỗi
-   Xác nhận import

------------------------------------------------------------------------

## 5. Các màn hình chính

1.  Trang danh sách sự kiện
2.  Trang quản lý sự kiện & khách mời (Admin)
3.  Trang quét QR check-in (Staff -- không login)
4.  Trang monitor realtime

------------------------------------------------------------------------

## 6. Logic check-in

-   QR chỉ chứa `ma`
-   Khi quét:
    -   Tìm attendant theo `event_id + ma`
    -   Nếu chưa check-in:
        -   Update `checked_in_at`
        -   Insert `checkin_logs`
-   Monitor update realtime

------------------------------------------------------------------------

## 7. Yêu cầu phi chức năng

-   Không account staff
-   Import nhanh (batch)
-   UI rõ ràng cho sự kiện đông người
-   Không over-engineering

------------------------------------------------------------------------

## 8. Output mong muốn

-   Frontend hoàn chỉnh
-   Import Google Sheet / CSV
-   Realtime monitor
-   Chạy demo với Supabase thật
