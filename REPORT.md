# BÁO CÁO PHÁT TRIỂN SẢN PHẨM: HỆ THỐNG QUẢN LÝ VÀ ĐIỂM DANH SỰ KIỆN

## X.1. Đặt vấn đề và Nhu cầu thực tế
**Bối cảnh:**
Hiện nay, tại Trung tâm Chuyển giao công nghệ, Khởi nghiệp và Sự kiện, quy trình quản lý khách mời và điểm danh các chương trình vẫn còn mang tính thủ công (sử dụng danh sách giấy hoặc file Excel rời rạc). Điều này dẫn đến tình trạng ùn tắc tại cửa check-in đối với các sự kiện đông người, khó khăn trong việc tổng hợp dữ liệu báo cáo tức thời và thiếu tính liên kết dữ liệu giữa các bộ phận.

**Lý do thực hiện:**
Việc xây dựng một hệ thống quản lý tập trung là vô cùng cấp thiết nhằm:
- Hiện đại hóa quy trình làm việc của đơn vị trong kỷ nguyên chuyển đổi số.
- Tăng tính chuyên nghiệp khi đón tiếp khách mời, đặc biệt là các vị đại biểu (VIP).
- Đảm bảo tính chính xác và minh bạch của dữ liệu điểm danh, phục vụ công tác hậu cần và lưu trữ.

## X.2. Ý nghĩa và Mục tiêu triển khai
**Ý nghĩa:**
- **Về lý thuyết:** 
    - Nghiên cứu và áp dụng kiến trúc **Serverless** và **Microservices** thông qua việc kết hợp nhiều nền tảng Cloud (Vercel, Supabase, Hugging Face).
    - Tìm hiểu cơ chế trích xuất đặc trưng của mô hình **Deep Learning** (Face Embedding) và tính toán khoảng cách vector (Cosine Similarity) để nhận diện khuôn mặt.
    - Áp dụng quy trình phát triển sản phẩm thực tế, từ phân tích yêu cầu, thiết kế cơ sở dữ liệu đến triển khai (Deployment) và bảo trì.
- **Về thực tiễn:** 
    - **Tối ưu hóa vận hành:** Giải quyết triệt để bài toán điểm danh thủ công, giảm thời gian check-in từ vài phút xuống còn vài giây, loại bỏ hoàn toàn sai sót do con người.
    - **Số hóa dữ liệu:** Chuyển đổi toàn bộ quy trình quản lý khách mời, đoàn viên, Đảng viên từ giấy tờ/Excel rời rạc sang hệ thống quản lý tập trung, dữ liệu được cập nhật thời gian thực.
    - **Nâng cao tính chuyên nghiệp:** Việc sử dụng công nghệ nhận diện khuôn mặt và QR Code tạo nên hình ảnh hiện đại, đột phá cho các sự kiện của Trung tâm.
    - **Tiết kiệm nguồn lực:** Giảm thiểu chi phí in ấn thẻ/danh sách giấy và tiết kiệm nhân lực cho công tác hỗ trợ điểm danh.
- **Về cá nhân:** 
    - Làm chủ bộ công cụ Fullstack hiện đại (React, Python, Supabase).
    - Rèn luyện kỹ năng giải quyết vấn đề (Problem Solving) khi xử lý các giới hạn về tài nguyên hệ thống (hosting free tier) và tối ưu hóa hiệu năng model AI.

**Mục tiêu:**
- Xây dựng hoàn thiện hệ thống quản lý sự kiện (Dashboard điều hành).
- Triển khai thành công ứng dụng điểm danh đa phương thức: Nhận diện khuôn mặt (Face Recognition) và Quét mã QR.
- Hoàn thiện tính năng xuất báo cáo Excel chi tiết và thống kê thời gian thực trên màn hình Monitor.

## X.3. Phạm vi và Đối tượng sử dụng
**Phạm vi:**
- Hệ thống tập trung vào xây dựng nền tảng Web Application (Responsive) hỗ trợ đa thiết bị (PC, tablet, mobile).
- Tập trung tối ưu hóa giao diện người dùng (UI/UX) và luồng xử lý nhận diện AI ổn định.
- Phiên bản hiện tại triển khai dưới dạng Demo thực tế, sử dụng hạ tầng Cloud miễn phí (Vercel, Hugging Face, Supabase) để tối ưu chi phí nhưng vẫn đảm bảo khả năng vận hành trực tuyến.

**Đối tượng sử dụng:**
- **Quản trị viên (Super Admin):** Cán bộ Trung tâm quản lý toàn bộ hệ thống.
- **Tình nguyện viên/Cộng tác viên:** Sử dụng ứng dụng để hỗ trợ check-in tại hiện trường.
- **Khách mời/Sinh viên:** Tự đăng ký thông tin và nhận mã định danh cá nhân thông qua cổng đăng ký công cộng.

## X.4. Phương pháp và Công cụ thực hiện
**Phương pháp:**
- Khảo sát thực trạng và lấy ý kiến từ nhu cầu thực tế của lãnh đạo và cán bộ tại Trung tâm.
- Nghiên cứu tài liệu về các mô hình AI tiên tiến (InsightFace) và kiến trúc Serverless.
- Thực hành xây dựng mã nguồn theo mô hình Agile (phát triển và tối ưu liên tục theo phản hồi).

**Công cụ thực hiện (Tech Stack):**
- **Frontend:** React + Vite, Tailwind CSS, Lucide Icons.
- **Backend & Database:** Supabase (PostgreSQL, Storage, Realtime).
- **AI Backend:** Python (Flask), InsightFace Model (buffalo_l), Docker.
- **Deployment:** Vercel (Frontend), Hugging Face Spaces (AI Server).
- **Tiện ích:** XLSX library (Export report), html5-qrcode (QR scanning).
