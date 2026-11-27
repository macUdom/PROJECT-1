-- SavorBite — starter data sized for development.
-- Run AFTER 0001_schema.sql and 0002_rls_policies.sql.
-- Prices are in KOBO (₦3,500 = 350000).

insert into public.categories (id, name, blurb, image_url) values
  ('11111111-0000-0000-0000-000000000001', 'Rice & Grains', 'Party jollof, fried rice, ofada', null),
  ('11111111-0000-0000-0000-000000000002', 'Swallow',        'Pounded yam, eba, amala',       null),
  ('11111111-0000-0000-0000-000000000003', 'Grills & Proteins','Suya, asun, grilled chicken',  null),
  ('11111111-0000-0000-0000-000000000004', 'Small Chops',    'Puff-puff, samosa, chin chin',  null),
  ('11111111-0000-0000-0000-000000000005', 'Soups & Stews',  'Egusi, efo riro, pepper soup',  null),
  ('11111111-0000-0000-0000-000000000006', 'Drinks',         'Zobo, chapman, fresh juice',    null)
on conflict (id) do nothing;

-- NOTE: create an admin account from the API or dashboard, then:
--   update public.profiles set role = 'admin' where id = '<uuid from auth.users>';

-- Demo products with original stock (mirrors savorbite-api/scripts/seed.mjs).
-- Prices are in KOBO. available = stock > 0.
insert into public.products (id, category_id, name, description, unit, price_kobo, stock, available, featured) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Smoky Party Jollof', 'Slow-cooked long-grain rice in our signature smoky pepper base, finished with sliced onions and tomato.', 'Big plate, serves 2', 350000, 12, true, true),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Local Fried Rice', 'Rice fried with liver, kidney beans, sweet corn and carrots in a light curry base.', 'Medium plate, serves 1-2', 320000, 18, true, false),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Coconut Jollof Rice', 'Jollof rice cooked in fresh coconut milk with a hint of ginger.', 'Medium plate, serves 1-2', 380000, 9, true, false),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Ofada Rice & Ayamase', 'Local Ofada rice with red ayamase, ponmo, shaki and cow skin.', 'Serves 2, with assorted meat', 520000, 6, true, true),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Pounded Yam (portion)', 'Smooth, hand-pounded yam with a light stretch.', 'Single portion', 200000, 22, true, false),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 'Eba (portion)', 'Freshly made eba from premium garri.', 'Single portion', 80000, 30, true, false),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 'Grilled Chicken (quarter)', 'Marinated overnight in ginger and house spice, coal-grilled to order.', 'Quarter bird, with plantain', 390000, 14, true, true),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000003', 'Beef Suya (150g)', 'Thin-sliced beef in groundnut-spiced yaji, grilled over open flame.', '150g, with yaji pepper', 250000, 5, true, false),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000003', 'Peppered Gizzard', 'Slow-braised gizzard finished in a glossy pepper sauce.', '250g, grilled then stewed', 300000, 11, true, false),
  ('22222222-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000004', 'Mini Puff-Puff (10 pcs)', 'Little fried dough balls, crisp outside and pillow-soft inside.', 'Box of 10, dusted in sugar', 120000, 40, true, true),
  ('22222222-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000004', 'Samosa (6 pcs)', 'Hand-folded triangles with seasoned minced beef.', 'Pack of 6, minced beef filling', 220000, 16, true, false),
  ('22222222-0000-0000-0000-000000000012', '11111111-0000-0000-0000-000000000004', 'Chin Chin (cup)', 'Crunchy fried pastry bites with a nutmeg finish.', 'Cup, ~150g', 70000, 55, true, false),
  ('22222222-0000-0000-0000-000000000013', '11111111-0000-0000-0000-000000000005', 'Egusi Soup (with protein)', 'Melon-seed stew with palm oil, spinach, goat meat and dry fish.', 'Serves 2, goat meat & stockfish', 400000, 10, true, false),
  ('22222222-0000-0000-0000-000000000014', '11111111-0000-0000-0000-000000000005', 'Efo Riro', 'Rich spinach stew with assorted meat and locust beans.', 'Serves 2, locust bean base', 380000, 0, false, false),
  ('22222222-0000-0000-0000-000000000015', '11111111-0000-0000-0000-000000000005', 'Catfish Pepper Soup', 'Light, fragrant broth with fresh catfish, utazi and pepper kick.', 'Serves 1-2, fresh catfish', 450000, 7, true, false),
  ('22222222-0000-0000-0000-000000000016', '11111111-0000-0000-0000-000000000006', 'Zobo Drink (500ml)', 'Hibiscus steeped with pineapple, ginger and cloves.', 'Bottle, 500ml', 100000, 35, true, true),
  ('22222222-0000-0000-0000-000000000017', '11111111-0000-0000-0000-000000000006', 'Chapman (500ml)', 'Citrus, bitters and sparkling water over ice.', 'Bottle, 500ml', 120000, 41, true, false),
  ('22222222-0000-0000-0000-000000000018', '11111111-0000-0000-0000-000000000006', 'Fresh Orange Juice', 'Squeezed from Valencia oranges every morning.', 'Glass, 400ml', 150000, 20, true, false)
on conflict (id) do nothing;

-- NOTE: create an admin account from the API or dashboard, then:
--   update public.profiles set role = 'admin' where id = '<uuid from auth.users>';
