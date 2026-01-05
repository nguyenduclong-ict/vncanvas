-- Seed data for destinations table
DELETE FROM destinations;

INSERT INTO destinations (slug, title, region, province, category, short_desc, long_desc, thumbnail, cover_image, mood_tags, audio_url, detail_json, created_at) VALUES 
(
  'ha-long-bay',
  'Vịnh Hạ Long',
  'north',
  'Quảng Ninh',
  'nature',
  'Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi.',
  'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên của thế giới, nổi tiếng với hệ thống đảo đá vôi và hang động tuyệt đẹp. Nơi đây thu hút hàng triệu du khách mỗi năm đến tham quan, du thuyền và khám phá vẻ đẹp hùng vĩ của thiên nhiên.',
  '/images/halong.jpg',
  '/images/halong-cover.jpg',
  '["majestic", "peaceful", "wonder"]',
  '/audio/halong.mp3',
  '{"bestTime":"Tháng 4 - Tháng 6 hoặc Tháng 9 - Tháng 11","transport":"Xe khách từ Hà Nội (2.5h), Tàu hỏa, Thủy phi cơ","tips":"Nên đặt du thuyền trước ít nhất 2 tuần. Mang theo kem chống nắng và kính râm.","sections":[{"type":"intro","content":"Hạ Long - Kỳ quan đá dựng giữa trời xanh.","image":"/images/halong-intro.jpg"},{"type":"history","content":"Truyền thuyết Rồng Mẹ xuống trần gian..."}]}',
  datetime('now')
),
(
  'hoi-an',
  'Phố Cổ Hội An',
  'central',
  'Quảng Nam',
  'culture',
  'Thành phố cổ kính với những ngôi nhà vàng và đèn lồng.',
  'Hội An là một thương cảng sầm uất từ thế kỷ 15 đến 19. Ngày nay, nơi đây lưu giữ được vẻ đẹp cổ kính với kiến trúc độc đáo, văn hóa ẩm thực phong phú và những đêm thả đèn hoa đăng lung linh trên sông Hoài.',
  '/images/hoian.jpg',
  '/images/hoian-cover.jpg',
  '["nostalgic", "romantic", "colorful"]',
  '/audio/hoian.mp3',
  '{"bestTime":"Tháng 2 - Tháng 4 (mùa khô, mát mẻ)","transport":"Máy bay đến Đà Nẵng, sau đó taxi/bus (30km)","tips":"Nên đi dạo phố cổ vào sáng sớm hoặc chiều tối. Thử món Cao Lầu.","sections":[{"type":"intro","content":"Hội An - Nơi thời gian ngưng đọng.","image":"/images/hoian-intro.jpg"},{"type":"culture","content":"Đèn lồng và những kiến trúc cổ..."}]}',
  datetime('now')
),
(
  'sai-gon',
  'TP. Hồ Chí Minh',
  'south',
  'TP. Hồ Chí Minh',
  'city',
  'Trung tâm kinh tế năng động và hiện đại nhất cả nước.',
  'Thành phố Hồ Chí Minh (Sài Gòn) là đô thị lớn nhất Việt Nam, nơi giao thoa giữa văn hóa Đông - Tây, giữa nét cổ kính và hiện đại. Nơi đây nổi tiếng với nhịp sống sôi động, ẩm thực đường phố đa dạng và những công trình kiến trúc thời Pháp thuộc.',
  '/images/saigon.jpg',
  '/images/saigon-cover.jpg',
  '["dynamic", "modern", "nightlife"]',
  '/audio/saigon.mp3',
  '{"bestTime":"Tháng 12 - Tháng 4 (mùa khô)","transport":"Máy bay Tân Sơn Nhất, Tàu hỏa, Xe khách","tips":"Cẩn thận tư trang chỗ đông người. Nên trải nghiệm cà phê bệt và xe buýt sông.","sections":[{"type":"intro","content":"Sài Gòn - Thành phố không ngủ.","image":"/images/saigon-intro.jpg"},{"type":"lifestyle","content":"Nhịp sống hối hả và ẩm thực đường phố..."}]}',
  datetime('now')
);
