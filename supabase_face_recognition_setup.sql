-- 1. Mở rộng bảng attendants để lưu dữ liệu khuôn mặt (face_descriptor)
-- Chúng ta dùng kiểu JSONB để lưu mảng vector đặc trưng khuôn mặt một cách linh hoạt
ALTER TABLE public.attendants 
ADD COLUMN IF NOT EXISTS face_descriptor JSONB;

-- 2. Tạo Storage Bucket mới tên là 'attendant-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendant-photos', 'attendant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Thiết lập Policies (Quyền truy cập) cho Storage Bucket 'attendant-photos'

-- Policy 1: Cho phép mọi người (Public) xem ảnh
CREATE POLICY "Public Access for Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attendant-photos' );

-- Policy 2: Cho phép upload ảnh (Trong thực tế nên giới hạn cho Staff/Authenticated users)
CREATE POLICY "Allow Upload Photos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'attendant-photos' );

-- Policy 3: Cho phép update/delete ảnh
CREATE POLICY "Allow Update Photos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'attendant-photos' );

CREATE POLICY "Allow Delete Photos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'attendant-photos' );

-- 4. Tối ưu hiệu năng tìm kiếm (INDEXES)
-- Quan trọng: Giúp load danh sách khách mời của sự kiện cực nhanh
CREATE INDEX IF NOT EXISTS idx_attendants_event_id ON public.attendants(event_id);

-- Giúp tìm kiếm nhanh theo mã code hoặc tên
CREATE INDEX IF NOT EXISTS idx_attendants_code ON public.attendants(code);
CREATE INDEX IF NOT EXISTS idx_attendants_full_name ON public.attendants(full_name);

-- 5. (Nâng cao/Tùy chọn) Chuẩn bị cho tìm kiếm Vector phía Server sau này
-- Nếu bạn muốn dùng pgvector để so khớp khuôn mặt ngay trên database (thay vì tải về web app)
-- Bỏ comment các dòng dưới đây để chạy:
/*
  CREATE EXTENSION IF NOT EXISTS vector;
  -- Lưu ý: Bạn cần chuyển cột face_descriptor sang kiểu vector(128) trước khi đánh index HNSW
  -- ALTER TABLE attendants ALTER COLUMN face_descriptor TYPE vector(128) USING (jsonb_array_to_vector(face_descriptor));
  -- CREATE INDEX ON attendants USING hnsw (face_descriptor vector_cosine_ops);
*/
