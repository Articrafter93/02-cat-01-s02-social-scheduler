-- 004: Storage bucket for post media (images).
-- Namespaced for schema-pooling. Public read (URL contains an unguessable UUID
-- path); writes are RLS-scoped to org membership via the path convention
-- `{organization_id}/{uuid}.{ext}`, reusing cat01s02_scheduler.user_org_ids().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat01s02-post-media', 'cat01s02-post-media', true,
  5242880, -- 5 MB
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cat01s02_media_insert" on storage.objects;
create policy "cat01s02_media_insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'cat01s02-post-media'
  and (((storage.foldername(name))[1])::uuid = any(cat01s02_scheduler.user_org_ids()))
);

drop policy if exists "cat01s02_media_update" on storage.objects;
create policy "cat01s02_media_update" on storage.objects for update to authenticated
using (
  bucket_id = 'cat01s02-post-media'
  and (((storage.foldername(name))[1])::uuid = any(cat01s02_scheduler.user_org_ids()))
);

drop policy if exists "cat01s02_media_delete" on storage.objects;
create policy "cat01s02_media_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'cat01s02-post-media'
  and (((storage.foldername(name))[1])::uuid = any(cat01s02_scheduler.user_org_ids()))
);
