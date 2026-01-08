export const REGIONS_DATA: Record<string, any> = {
  vi: {
    north: {
      name: "Miền Bắc",
      slogan: "Ngàn năm văn hiến & Kỳ quan thiên nhiên",
      thumbnail: "/images/mien-bac.jpg",
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
      thumbnail: "/images/mien-trung.jpg",
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
      thumbnail: "/images/mien-nam.jpg",
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
  },
  en: {
    north: {
      name: "Northern Vietnam",
      slogan: "Thousand years of civilization & Natural wonders",
      thumbnail: "/images/mien-bac.jpg",
      description:
        "The cultural cradle of Vietnam with the thousand-year-old capital Hanoi, majestic Northwest mountains, and the wonder of Ha Long Bay.",
      features: [
        {
          icon: "cloud-sun",
          title: "Weather",
          text: "Tropical monsoon climate with a cold winter. Four distinct seasons: Spring - Summer - Autumn - Winter.",
        },
        {
          icon: "users",
          title: "People",
          text: "Elegant, sophisticated, valuing traditional etiquette and hospitality.",
        },
        {
          icon: "map",
          title: "Geography",
          text: "Diverse terrain: high mountains in the North, fertile Red River Delta.",
        },
      ],
    },
    central: {
      name: "Central Vietnam",
      slogan: "Heritage Road & Blue Sea",
      thumbnail: "/images/mien-trung.jpg",
      description:
        "A land full of sun and wind, a convergence of world cultural heritage sites and the most beautiful beaches.",
      features: [
        {
          icon: "sun",
          title: "Weather",
          text: "Harsher climate, divided into distinct rainy and dry seasons.",
        },
        {
          icon: "heart",
          title: "People",
          text: "Honest, sincere, hardworking, resilient, and hospitable.",
        },
        {
          icon: "mountain",
          title: "Geography",
          text: 'Narrow terrain, "backing against Truong Son mountains, facing the East Sea".',
        },
      ],
    },
    south: {
      name: "Southern Vietnam",
      slogan: "Land of Generosity & Rivers",
      thumbnail: "/images/mien-nam.jpg",
      description:
        "Dynamic, modern land blending with the rustic charm of the Western river region.",
      features: [
        {
          icon: "umbrella",
          title: "Weather",
          text: "Sub-equatorial climate, warm all year round. Only two seasons: rainy and dry.",
        },
        {
          icon: "smile",
          title: "People",
          text: "Generous, liberal, open-minded, and friendly. Optimistic lifestyle.",
        },
        {
          icon: "waves",
          title: "Geography",
          text: "Mekong Delta crisscrossed with rivers and canals.",
        },
      ],
    },
  },
};

const set: any = {};
for (const localeKey in REGIONS_DATA) {
  Object.keys(REGIONS_DATA[localeKey]).forEach((regionKey) => {
    set[regionKey] = set[regionKey] || { key: regionKey, label: {} };
    set[regionKey].label[localeKey] = REGIONS_DATA[localeKey][regionKey].name;
  });
}

export const REGIONS = Object.values(set) as {
  key: string;
  label: Record<string, string>;
}[];
