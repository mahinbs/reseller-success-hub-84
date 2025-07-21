
# BoostMySites - AI-Powered Digital Services

## About BoostMySites

BoostMySites is a comprehensive platform offering premium AI-powered digital services for businesses. Our services include web development, SEO optimization, content creation, social media management, and more.

## Features

- **AI-Powered Services**: Cutting-edge AI technology for superior results
- **Comprehensive Solutions**: Web development, SEO, content creation, and digital marketing
- **User-Friendly Dashboard**: Intuitive interface for managing services and purchases
- **Secure Authentication**: Robust user authentication and profile management
- **Responsive Design**: Optimized for all devices and screen sizes
- **🚀 Complete Payment Integration**: Secure Razorpay checkout with real-time processing
- **💳 Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets, EMI
- **🛡️ Server-side Security**: HMAC verification and secure order management
- **📱 Mobile-First Design**: Optimized checkout experience for all devices

## Technology Stack

This project is built with modern web technologies:

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database, Authentication, Storage)
- **Deployment**: Optimized for modern web platforms

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- Razorpay account (for payments)

### Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd reseller-success-hub-84
   npm install
   ```

2. **Setup Environment**:
   ```bash
   # Create .env.local
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
   ```

3. **Deploy Payment Functions** (5 minutes):
   ```bash
   # Link to your Supabase project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Deploy payment functions
   ./deploy-functions-simple.sh
   ```

4. **Set Supabase Environment Variables**:
   - Go to Supabase Dashboard → Settings → Environment Variables
   - Add: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

5. **Start Development**:
   ```bash
   npm run dev
   ```

🎉 **Your complete payment system is now ready!**

### 📚 Setup Guides
- **Quick Setup**: See `SIMPLE_SETUP.md` for 5-minute payment integration
- **Full Features**: See `SUPABASE_SETUP.md` for webhooks and advanced features
- **Client Setup**: See `CHECKOUT_SETUP.md` for frontend configuration

## Services Offered

- **Web Development**: Custom websites and web applications
- **SEO Services**: Search engine optimization and ranking
- **Content Creation**: AI-powered content generation
- **Social Media Management**: Complete social media solutions
- **Digital Marketing**: Comprehensive marketing campaigns
- **Analytics & Reporting**: Data-driven insights and reports

## 💳 Payment System Features

- **🔒 Secure Checkout**: Server-side order creation and verification
- **💰 Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets, EMI
- **📊 GST Calculations**: Automatic 18% GST handling
- **📱 Mobile Optimized**: Responsive payment forms
- **⚡ Real-time Updates**: Live payment status tracking
- **🛡️ Production Ready**: HMAC signature verification
- **🎯 Easy Integration**: 5-minute setup with Razorpay

## Support

For support and inquiries, please contact our team through the platform's support system.

## License

This project is proprietary software. All rights reserved.
