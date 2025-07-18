// Stock Image Library for Services and Bundles
export interface StockImage {
  url: string;
  title: string;
  category: string;
}

export const serviceStockImages: StockImage[] = [
  // AI & ML Services
  { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop", title: "AI Neural Network", category: "Artificial Intelligence Development" },
  { url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop", title: "Machine Learning", category: "Artificial Intelligence Development" },
  { url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop", title: "Chatbot Interface", category: "Chatbot Development" },
  { url: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=600&fit=crop", title: "Robot Assistant", category: "Chatbot Development" },

  // Analytics
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop", title: "Data Dashboard", category: "Data Analytics & BI" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop", title: "Analytics Charts", category: "Data Analytics & BI" },

  // Blockchain
  { url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop", title: "Blockchain Network", category: "Blockchain Development" },
  { url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop", title: "Cryptocurrency", category: "Blockchain Development" },

  // Design
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop", title: "UX/UI Design", category: "UX/UI Design" },
  { url: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=600&fit=crop", title: "Design Mockups", category: "UX/UI Design" },

  // Development
  { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop", title: "Code Development", category: "Web Full-stack Development" },
  { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop", title: "Developer Workspace", category: "Web Full-stack Development" },
  { url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop", title: "Mobile Development", category: "Mobile App Development" },
  { url: "https://images.unsplash.com/photo-1572177812156-58036aae439c?w=800&h=600&fit=crop", title: "App Interface", category: "Mobile App Development" },

  // Gaming
  { url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop", title: "Game Controller", category: "Game Development" },
  { url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop", title: "Gaming Setup", category: "Game Development" },

  // Immersive Tech
  { url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop", title: "VR Headset", category: "VR/AR Development" },
  { url: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=600&fit=crop", title: "Augmented Reality", category: "VR/AR Development" },

  // Infrastructure
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop", title: "Cloud Computing", category: "Cloud Computing" },
  { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop", title: "Data Center", category: "Cloud Computing" },

  // IoT
  { url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop", title: "IoT Devices", category: "IoT Development" },
  { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop", title: "Smart Home", category: "IoT Development" },

  // SaaS Products
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop", title: "Browser Automation", category: "ChromeBot.ai" },
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop", title: "Project Management", category: "Projectsy.ai" },
  { url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop", title: "Audio Technology", category: "Speaksify" },
  { url: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=600&fit=crop", title: "Virtual Collaboration", category: "VirtuTeams" }
];

export const bundleStockImages: StockImage[] = [
  { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop", title: "AI Development Suite", category: "AI Development Bundle" },
  { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop", title: "Full-Stack Development", category: "Full-Stack Web Bundle" },
  { url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop", title: "Mobile & IoT", category: "Mobile & IoT Bundle" },
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop", title: "SaaS Platform", category: "SaaS Starter Bundle" }
];

export const getImagesByCategory = (category: string): StockImage[] => {
  return serviceStockImages.filter(img => img.category === category);
};

export const getAllImages = (): StockImage[] => {
  return [...serviceStockImages, ...bundleStockImages];
};