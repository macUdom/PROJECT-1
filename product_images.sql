-- Insert product_images for the demo dishes using the actual product IDs
-- Assumes products were seeded (or exist). Adjust names only if they differ.
-- Column names match 0001_schema.sql: id, product_id, url, position

insert into public.product_images (product_id, url, position)
select p.id,
       'https://www.chicken-republic.com/wp-content/uploads/2023/05/Chapman-Drink.jpg',
       0
from public.products p
where p.name ilike '%Chapman%'
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );

insert into public.product_images (product_id, url, position)
select p.id,
       'https://www.folklorecuisine.com/wp-content/uploads/2024/05/nigerian-chicken-suya-recipe-500x375.jpg',
       0
from public.products p
where p.name ilike '%Suya%'
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );

insert into public.product_images (product_id, url, position)
select p.id,
       'https://www.seriouseats.com/thmb/Bu3oAldTc6p_2jCUOlmkWwjFP4Q=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/jollof-rice-ghana-west-africa-seriouseats-20-6b9dd05f3e31481e95b79a5f907f9e2c.jpg',
       0
from public.products p
where (p.name ilike '%Jollof%' and p.name ilike '%Rice%')
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );

insert into public.product_images (product_id, url, position)
select p.id,
       'https://www.myactivekitchen.com/wp-content/uploads/2015/09/pounded-yam-egusi-soup-img-4.jpg',
       0
from public.products p
where (p.name ilike '%Pounded%' and (p.name ilike '%Yam%' or p.description ilike '%Egusi%' or p.name ilike '%Egusi%'))
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );

insert into public.product_images (product_id, url, position)
select p.id,
       'https://www.myactivekitchen.com/wp-content/uploads/2015/03/nigerian-puff-puff-image-4.jpg',
       0
from public.products p
where p.name ilike '%Puff-Puff%' or p.name ilike '%Puff Puff%'
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );
