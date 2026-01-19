# Docker là gì? (Giải thích đơn giản)

Tưởng tượng bạn muốn chuyển nhà (Deploy code):
- **Cách cũ**: Bạn vác từng món đồ (file code, thư viện) sang nhà mới, rồi phải tự lắp ráp, cài đặt điện nước (cài Python, cài thư viện...). Rất dễ thiếu đồ hoặc lắp sai.
- **Docker**: Bạn đóng gói TOÀN BỘ ngôi nhà của bạn vào một cái **Container** (Thùng hàng). Trong thùng đó có sẵn hết mọi thứ: code, python, thư viện, cài đặt... được sắp xếp y hệt ở nhà cũ.
- Khi chuyển sang nhà mới (Hugging Face / Server), bạn chỉ cần đặt cái thùng Container xuống là xong. Nó tự bung ra và chạy y chang như lúc ở nhà bạn. Không lỗi vặt, không thiếu file.

**Trong dự án này:**
Chúng ta sẽ viết 1 file tên là `Dockerfile` (Bảng kê khai hàng hóa). Nó sẽ bảo máy tính:
1.  Lấy Python 3.9 về.
2.  Cài thư viện InsightFace.
3.  Copy code của tôi vào.
4.  Chạy server lên.

Đơn giản vậy thôi!
