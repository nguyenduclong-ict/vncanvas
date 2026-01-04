// Regions metadata - static data since regions don't change often
// Could be moved to database if needed

export default defineEventHandler(() => {
  return {
    north: {
      name: "Miền Bắc",
      slogan: "Ngàn năm văn hiến & Kỳ quan thiên nhiên",
      description:
        "Cái nôi văn hóa của Việt Nam với thủ đô Hà Nội ngàn năm văn hiến, những dãy núi hùng vĩ Tây Bắc và kỳ quan vịnh Hạ Long.",
      features: [
        {
          icon: "cloud-sun",
          title: "Thời Tiết",
          text: "Khí hậu nhiệt đới gió mùa có mùa đông lạnh. Bốn mùa Xuân - Hạ - Thu - Đông rõ rệt.",
        },
        {
          icon: "users",
          title: "Con Người",
          text: "Thanh lịch, tinh tế, coi trọng lễ nghĩa truyền thống và hiếu khách.",
        },
        {
          icon: "map",
          title: "Địa Lý",
          text: "Địa hình đa dạng: núi cao phía Bắc, đồng bằng sông Hồng trù phú.",
        },
      ],
    },
    central: {
      name: "Miền Trung",
      slogan: "Cung đường Di sản & Biển xanh",
      description:
        "Mảnh đất đầy nắng và gió, nơi hội tụ của những di sản văn hóa thế giới và bãi biển đẹp nhất.",
      features: [
        {
          icon: "sun",
          title: "Thời Tiết",
          text: "Khí hậu khắc nghiệt hơn, chia thành mùa mưa và mùa khô rõ rệt.",
        },
        {
          icon: "heart",
          title: "Con Người",
          text: "Chân chất, thật thà, chịu thương chịu khó, kiên cường và hiếu khách.",
        },
        {
          icon: "mountain",
          title: "Địa Lý",
          text: 'Địa hình hẹp ngang, "lưng tựa Trường Sơn, mặt hướng Biển Đông".',
        },
      ],
    },
    south: {
      name: "Miền Nam",
      slogan: "Vùng đất Phóng khoáng & Sông nước",
      description:
        "Vùng đất năng động, hiện đại hòa quyện cùng nét mộc mạc của miền Tây sông nước.",
      features: [
        {
          icon: "umbrella",
          title: "Thời Tiết",
          text: "Khí hậu cận xích đạo, nóng ấm quanh năm. Chỉ có hai mùa mưa và khô.",
        },
        {
          icon: "smile",
          title: "Con Người",
          text: "Hào sảng, phóng khoáng, cởi mở và dễ mến. Phong cách sống lạc quan.",
        },
        {
          icon: "waves",
          title: "Địa Lý",
          text: "Đồng bằng sông Cửu Long chằng chịt sông ngòi, kênh rạch.",
        },
      ],
    },
  };
});
