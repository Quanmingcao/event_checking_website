-- Chạy script này trong SQL Editor của Supabase

-- 1. Tạo bảng Nhóm (Event Groups)
CREATE TABLE IF NOT EXISTS public.event_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_count INTEGER DEFAULT 0, -- 0 means unlimited or handle logic as needed, usually > 0
    zone_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Cấp quyền cho bảng event_groups
ALTER TABLE public.event_groups ENABLE ROW LEVEL SECURITY;
-- Cho phép đọc công khai (để trang đăng ký load được list)
CREATE POLICY "Public read event_groups" ON public.event_groups FOR SELECT USING (true);
-- Cho phép full quyền (insert/update/delete) (đơn giản hóa cho prototype)
CREATE POLICY "Full access event_groups" ON public.event_groups FOR ALL USING (true);

-- 3. Thêm cột vào bảng attendants
ALTER TABLE public.attendants ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.event_groups(id);
ALTER TABLE public.attendants ADD COLUMN IF NOT EXISTS seat_location TEXT;
