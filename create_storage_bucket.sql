-- Tạo bucket 'event-backgrounds' trong Supabase Storage
-- Chạy script này trong SQL Editor của Supabase Dashboard nếu bucket chưa tồn tại.

insert into storage.buckets (id, name, public)
values ('event-backgrounds', 'event-backgrounds', true)
on conflict (id) do nothing;

-- Cho phép upload (Policy)
-- Lưu ý: Đây là policy mở (public) cho demo. Trong thực tế nên restrict theo user authenticated.
create policy "Public Access to Event Backgrounds"
on storage.objects for select
using ( bucket_id = 'event-backgrounds' );

create policy "Authenticated Users can Upload Event Backgrounds"
on storage.objects for insert
with check ( bucket_id = 'event-backgrounds' );

create policy "Authenticated Users can Update Event Backgrounds"
on storage.objects for update
with check ( bucket_id = 'event-backgrounds' );
