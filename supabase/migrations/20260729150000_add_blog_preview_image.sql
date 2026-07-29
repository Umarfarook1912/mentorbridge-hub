-- Store Medium/Open Graph preview images for blog cards
alter table public.blogs
  add column if not exists preview_image_url text;
