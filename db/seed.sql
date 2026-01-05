-- Seed data for destinations table
DELETE FROM destination_translations;
DELETE FROM destinations;

-- 1. Ha Long Bay
INSERT INTO destinations (id, slug, region, province, category, mood_tags, thumbnail, cover_image, audio_url, created_at) VALUES 
(1, 'ha-long-bay', 'north', 'Quảng Ninh', 'nature', '["majestic", "peaceful", "wonder"]', '/images/halong.jpg', '/images/halong-cover.jpg', '/audio/halong.mp3', datetime('now'));

INSERT INTO destination_translations (destination_id, language_code, title, short_desc, long_desc, detail_json) VALUES 
(1, 'vi', 
  'Vịnh Hạ Long',  
  'Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi.', 
  'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên của thế giới...', 
  '{"bestTime":"Tháng 4 - Tháng 6 hoặc Tháng 9 - Tháng 11","transport":"Xe khách từ Hà Nội (2.5h)","tips":"Nên đặt du thuyền trước ít nhất 2 tuần.","sections":[{"type":"intro","content":"Hạ Long - Kỳ quan đá dựng giữa trời xanh.","image":"/images/halong-intro.jpg"},{"type":"history","content":"Truyền thuyết Rồng Mẹ xuống trần gian..."}]}'
),
(1, 'en', 
  'Ha Long Bay', 
  'World Natural Heritage site with thousands of limestone islands.', 
  'Ha Long Bay is one of the world natural wonders...', 
  '{"bestTime":"Apr - Jun or Sep - Nov","transport":"Bus from Hanoi (2.5h)","tips":"Book cruise at least 2 weeks in advance.","sections":[{"type":"intro","content":"Ha Long - The wonder of stone standing in the blue sky.","image":"/images/halong-intro.jpg"},{"type":"history","content":"Legend of Mother Dragon descending to earth..."}]}'
);

-- 2. Hoi An
INSERT INTO destinations (id, slug, region, province, category, mood_tags, thumbnail, cover_image, audio_url, created_at) VALUES 
(2, 'hoi-an', 'central', 'Quảng Nam', 'culture', '["nostalgic", "romantic", "colorful"]', '/images/hoian.jpg', '/images/hoian-cover.jpg', '/audio/hoian.mp3', datetime('now'));

INSERT INTO destination_translations (destination_id, language_code, title, short_desc, long_desc, detail_json) VALUES 
(2, 'vi', 
  'Phố Cổ Hội An', 
  'Thành phố cổ kính với những ngôi nhà vàng và đèn lồng.', 
  'Hội An là một thương cảng sầm uất từ thế kỷ 15 đến 19...', 
  '{"bestTime":"Tháng 2 - Tháng 4","transport":"Máy bay đến Đà Nẵng","tips":"Nên đi dạo phố cổ vào sáng sớm.","sections":[{"type":"intro","content":"Hội An - Nơi thời gian ngưng đọng.","image":"/images/hoian-intro.jpg"}]}'
),
(2, 'en', 
  'Hoi An Ancient Town', 
  'An ancient city with yellow houses and lanterns.', 
  'Hoi An was a bustling trading port from the 15th to 19th century...', 
  '{"bestTime":"Feb - Apr","transport":"Fly to Da Nang","tips":"Walk around the old town in the early morning.","sections":[{"type":"intro","content":"Hoi An - Where time stands still.","image":"/images/hoian-intro.jpg"}]}'
);

-- 3. Sai Gon
INSERT INTO destinations (id, slug, region, province, category, mood_tags, thumbnail, cover_image, audio_url, created_at) VALUES 
(3, 'sai-gon', 'south', 'TP. Hồ Chí Minh', 'city', '["dynamic", "modern", "nightlife"]', '/images/saigon.jpg', '/images/saigon-cover.jpg', '/audio/saigon.mp3', datetime('now'));

INSERT INTO destination_translations (destination_id, language_code, title, short_desc, long_desc, detail_json) VALUES 
(3, 'vi', 
  'TP. Hồ Chí Minh', 
  'Trung tâm kinh tế năng động và hiện đại nhất cả nước.', 
  'Sài Gòn là đô thị lớn nhất Việt Nam...', 
  '{"bestTime":"Tháng 12 - Tháng 4","transport":"Máy bay Tân Sơn Nhất","tips":"Cẩn thận tư trang chỗ đông người.","sections":[{"type":"intro","content":"Sài Gòn - Thành phố không ngủ.","image":"/images/saigon-intro.jpg"}]}'
),
(3, 'en', 
  'Ho Chi Minh City', 
  'The most dynamic and modern economic center of the country.', 
  'Saigon is the largest city in Vietnam...', 
  '{"bestTime":"Dec - Apr","transport":"Tan Son Nhat Airport","tips":"Watch out for belongings in crowded places.","sections":[{"type":"intro","content":"Saigon - The city that never sleeps.","image":"/images/saigon-intro.jpg"}]}'
);
