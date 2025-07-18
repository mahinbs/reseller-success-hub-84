
-- Clear existing demo data
DELETE FROM bundle_services;
DELETE FROM bundles;
DELETE FROM services;

-- Insert your 11 development services
INSERT INTO services (name, description, category, price, billing_period, features, is_active) VALUES
('UX/UI Design', 'Professional user experience and interface design services to create intuitive and engaging digital products', 'Design', 2500.00, 'project', '["User Research & Analysis", "Wireframing & Prototyping", "Visual Design", "Usability Testing", "Design System Creation"]', true),

('Mobile App Development', 'Native and cross-platform mobile application development for iOS and Android', 'Development', 15000.00, 'project', '["Native iOS Development", "Native Android Development", "Cross-platform Solutions", "App Store Deployment", "Maintenance & Updates"]', true),

('Web Full-stack Development', 'Complete web application development from frontend to backend with modern technologies', 'Development', 12000.00, 'project', '["Frontend Development", "Backend API Development", "Database Design", "Cloud Deployment", "Performance Optimization"]', true),

('Cloud Computing Services', 'Comprehensive cloud infrastructure setup, migration, and management services', 'Infrastructure', 8000.00, 'project', '["Cloud Migration", "Infrastructure Setup", "Auto-scaling Configuration", "Security Implementation", "Cost Optimization"]', true),

('Artificial Intelligence Development', 'Custom AI solutions including machine learning models, NLP, and computer vision', 'AI & ML', 20000.00, 'project', '["Machine Learning Models", "Natural Language Processing", "Computer Vision", "AI Integration", "Model Training & Optimization"]', true),

('Data Analytics & Business Intelligence', 'Transform your data into actionable insights with advanced analytics and BI solutions', 'Analytics', 10000.00, 'project', '["Data Pipeline Setup", "Business Intelligence Dashboards", "Predictive Analytics", "Data Visualization", "Reporting Automation"]', true),

('IoT Development', 'Internet of Things solutions connecting devices, sensors, and systems', 'IoT', 18000.00, 'project', '["Device Integration", "Sensor Network Setup", "Real-time Data Processing", "Mobile App Integration", "Cloud Connectivity"]', true),

('VR/AR Development', 'Immersive virtual and augmented reality experiences for various platforms', 'Immersive Tech', 25000.00, 'project', '["VR Application Development", "AR Mobile Apps", "3D Environment Creation", "Interactive Experiences", "Multi-platform Support"]', true),

('Blockchain Development', 'Secure blockchain solutions, smart contracts, and decentralized applications', 'Blockchain', 22000.00, 'project', '["Smart Contract Development", "DApp Creation", "Blockchain Integration", "Cryptocurrency Solutions", "Security Auditing"]', true),

('Game Development', 'Engaging game development for mobile, web, and desktop platforms', 'Gaming', 30000.00, 'project', '["2D/3D Game Development", "Game Design & Mechanics", "Multi-platform Deployment", "Monetization Integration", "Live Game Operations"]', true),

('Chatbot Development', 'Intelligent conversational AI chatbots for customer service and engagement', 'AI & ML', 5000.00, 'project', '["Natural Language Processing", "Multi-platform Integration", "Custom Training", "Analytics & Insights", "24/7 Support"]', true);

-- Insert your 4 SaaS products
INSERT INTO services (name, description, category, price, billing_period, features, is_active) VALUES
('Speaksify', 'Advanced text-to-speech platform with natural-sounding voices and multi-language support', 'SaaS Product', 29.99, 'monthly', '["Natural Voice Synthesis", "Multi-language Support", "API Integration", "Bulk Processing", "Custom Voice Training"]', true),

('Projectsy.ai', 'AI-powered project management tool that automates task planning and resource allocation', 'SaaS Product', 49.99, 'monthly', '["AI Task Planning", "Resource Optimization", "Team Collaboration", "Progress Tracking", "Automated Reporting"]', true),

('VirtuTeams', 'Virtual team collaboration platform with advanced communication and project management features', 'SaaS Product', 39.99, 'monthly', '["Virtual Workspaces", "Team Communication", "File Sharing", "Video Conferencing", "Project Tracking"]', true),

('ChromeBot.ai', 'Intelligent Chrome extension for web automation and data extraction', 'SaaS Product', 19.99, 'monthly', '["Web Automation", "Data Extraction", "Smart Forms", "Workflow Creation", "Browser Integration"]', true);

-- Create bundles combining related services
INSERT INTO bundles (name, description, discount_percentage, total_price, is_active) VALUES
('AI Development Bundle', 'Complete AI solution package including development, chatbots, and analytics', 15, 29750.00, true),
('Full-Stack Web Bundle', 'End-to-end web development with UX/UI design and cloud deployment', 20, 17200.00, true),
('Mobile & IoT Bundle', 'Comprehensive mobile and IoT development package', 18, 27060.00, true),
('SaaS Starter Bundle', 'All four SaaS products at a discounted rate', 25, 104.97, true);

-- Link services to bundles
INSERT INTO bundle_services (bundle_id, service_id) 
SELECT b.id, s.id FROM bundles b, services s 
WHERE b.name = 'AI Development Bundle' AND s.name IN ('Artificial Intelligence Development', 'Chatbot Development', 'Data Analytics & Business Intelligence');

INSERT INTO bundle_services (bundle_id, service_id) 
SELECT b.id, s.id FROM bundles b, services s 
WHERE b.name = 'Full-Stack Web Bundle' AND s.name IN ('Web Full-stack Development', 'UX/UI Design', 'Cloud Computing Services');

INSERT INTO bundle_services (bundle_id, service_id) 
SELECT b.id, s.id FROM bundles b, services s 
WHERE b.name = 'Mobile & IoT Bundle' AND s.name IN ('Mobile App Development', 'IoT Development');

INSERT INTO bundle_services (bundle_id, service_id) 
SELECT b.id, s.id FROM bundles b, services s 
WHERE b.name = 'SaaS Starter Bundle' AND s.name IN ('Speaksify', 'Projectsy.ai', 'VirtuTeams', 'ChromeBot.ai');
