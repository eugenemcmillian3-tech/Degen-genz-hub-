# DEGENZ GEN/Z HUB 🚀

**AI-Powered Memecoin, NFT & Viral Content Platform for Base & Farcaster**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/eugenemcmillian3-tech/Degen-genz-hub-)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF)](https://base.org)
[![Farcaster Mini-App](https://img.shields.io/badge/Farcaster-Mini--App-855DCD)](https://farcaster.xyz)

## 🎯 What is DEGENZ GEN/Z HUB?

A comprehensive AI-powered platform that onboards degens into the world of memecoins, NFTs, viral content creation, market analysis, and decentralized social features. All powered by cutting-edge AI and blockchain integrations.

## ✨ Features

### 🤖 AI Content Generation ($0.75-$5)
- **Memecoin Studio** - Generate quick concepts, full launch packs, and onchain helpers
- **NFT Generator** - Create collection ideas with AI-powered concepts
- **Meme Packs** - Generate viral-ready content for Farcaster and Twitter
- **Viral Scout** - AI research with live web scraping (Firecrawl)
- **AI Research** - Citations-backed answers with Perplexity AI

### ⛓️ Blockchain & NFT Tools ($0.75-$5)
- **NFT Minting** - Upload to IPFS with Pinata, get NFT-ready metadata
- **Memecoin Launch** - Deploy real tokens on Base via Flaunch API
- **Token Prices** - Real-time crypto prices via 0x API
- **Market Analysis** - Prediction market data from Adjacent News
- **Smart Contracts** - Natural language blockchain interactions via Thirdweb

### 🌐 Social & Community
- **Lens Protocol** - Decentralized social posting ($1.50-$2.50)
- **XMTP Chat** - Wallet-to-wallet encrypted messaging (FREE)
- **Builder Reputation** - Onchain credentials via Talent Protocol ($0.75-$1.50)
- **Contests** - Create and join memecoin/meme/NFT contests
- **Referrals** - Earn 5-20% commission on referred users

## 🔧 Tech Stack

- **Frontend**: Next.js 15 (App Router) with TypeScript
- **Authentication**: Farcaster Mini-App SDK + Base Account UI
- **Payments**: Base Pay, Coinbase Wallet, Multi-chain manual
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: OpenRouter (18 free models)
- **Blockchain**: OnchainKit, Wagmi, Viem
- **Deployment**: Vercel
- **Analytics**: PostHog

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenRouter API key
- OnchainKit API key (optional but recommended)

### 1. Clone & Install

```bash
git clone https://github.com/eugenemcmillian3-tech/Degen-genz-hub-.git
cd Degen-genz-hub-
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your keys:

```env
# === REQUIRED ===
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-key
NEXT_PUBLIC_HOST=http://localhost:3000

# === RECOMMENDED ===
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-onchainkit-key

# === OPTIONAL ===
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_BASE_CHAIN=base  # or 'base-sepolia' for testnet
```

### 3. Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the entire contents of `SUPABASE_SETUP.sql`
4. Click "Run" to create all tables and functions

### 4. Get API Keys

**OpenRouter** (Required for AI features)
- Visit [openrouter.ai](https://openrouter.ai/)
- Create account and get API key
- Supports 18 free models!

**OnchainKit** (Optional, for Coinbase Wallet)
- Visit [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
- Create project: "DEGENZ GEN/Z HUB"
- Generate API key (starts with `ock_`)

**PostHog** (Optional, for analytics)
- Visit [posthog.com](https://posthog.com/)
- Create project and get key

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## 💰 Payment Configuration

### Owner Wallets (Receives all payments)

- **EVM Chains**: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
  - Base, Ethereum, BSC, Arbitrum, Monad, HyperEVM, Celo
- **Solana**: `BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7`

### Supported Payment Methods

1. **Base Pay** - One-click payment in Base Builder context
2. **Coinbase Wallet** - Direct onchain payments (needs OnchainKit key)
3. **Manual Payment** - Send to wallet and paste tx hash (8 chains)
4. **Whitelist** - Free access for testing wallets

### Pricing Structure

All features priced between **$0.75 and $5.00**:
- Quick AI generations: $0.75-$1.50
- Full AI packs: $3.00-$5.00
- Blockchain tools: $2.00-$5.00
- Social features: $1.50-$2.50
- XMTP Chat: FREE

## 🎨 API Integrations (9 Free APIs)

- ✅ **Pinata** - NFT-ready IPFS uploads
- ✅ **Flaunch** - Real memecoin deployment
- ✅ **Adjacent News** - Prediction market data
- ✅ **Talent Protocol** - Builder reputation
- ✅ **0x API** - Token price quotes
- ✅ **Thirdweb** - Smart contract interactions
- ✅ **Perplexity** - AI research with citations
- ✅ **XMTP** - Decentralized messaging
- ✅ **Lens Protocol** - Decentralized social
- ✅ **Firecrawl** - Web scraping for viral content

## 📊 Database Schema

### Core Tables (9 total)

- `users` - Farcaster FIDs + wallet addresses
- `ai_jobs` - AI generation history
- `payments` - Multi-chain payment logs
- `referrals` - Referral codes
- `ref_earnings` - Commission tracking
- `contests` - Contest management
- `contest_entries` - User submissions
- `votes` - Contest voting (1 vote per FID)
- `meme_packs` - Generated content storage

See `SUPABASE_SETUP.sql` for complete schema.

## 🔒 Security Features

### Multi-Layer Validation
- ✅ Client-side input validation
- ✅ API route business logic checks
- ✅ Database-level constraints (CHECK, UNIQUE, FK)
- ✅ Pricing enforcement at all 3 layers ($0.75-$5.00)

### Whitelist System
Configure free access for testing in `src/lib/whitelist.ts`:
```typescript
WHITELISTED_FIDS: [1378286],
WHITELISTED_EVM: ["0xcc9569bF1d87B7a18BD3363413b823AaF06084d3"],
WHITELISTED_SOL: ["BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7"]
```

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables
6. Click "Deploy"

### Register as Farcaster Mini-App

1. Deploy to production first
2. Visit [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz)
3. Register your app with production URL
4. Verify manifest at `https://yourdomain.com/.well-known/farcaster.json`

## 📚 Documentation

- **`BASE_INTEGRATION_REQUIREMENTS.md`** - Base blockchain setup
- **`BASE_SETUP_GUIDE.md`** - Complete Base integration guide
- **`BASE_ACCOUNT_INTEGRATION.md`** - Base Account UI details
- **`BASE_PAY_INTEGRATION.md`** - Base Pay implementation
- **`SEO_OPTIMIZATION.md`** - SEO strategies
- **`PRODUCTION_READY.md`** - Production checklist
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step deployment
- **`IMPLEMENTATION_COMPLETE.md`** - Technical specs
- **`SUPABASE_SETUP.sql`** - Database schema

## 🎯 Roadmap

### Phase 1: MVP ✅ (COMPLETE)
- [x] AI content generation (6 types)
- [x] NFT minting with Pinata
- [x] Memecoin launching with Flaunch
- [x] Multi-chain payments
- [x] Contests system
- [x] Referral program
- [x] Base Pay integration
- [x] Farcaster Mini-App SDK
- [x] SEO optimization

### Phase 2: Enhanced Features 🚧 (Next)
- [ ] Live contest leaderboards
- [ ] Automated prize distribution (smart contracts)
- [ ] Advanced analytics dashboard
- [ ] Premium AI models tier
- [ ] Mobile app (React Native)
- [ ] Real-time notifications

### Phase 3: Scale 📈 (Future)
- [ ] Multi-language support
- [ ] Advanced trading features
- [ ] NFT marketplace integration
- [ ] DAO governance
- [ ] Token gating for premium features

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Base** - L2 blockchain infrastructure
- **Farcaster** - Decentralized social protocol
- **OpenRouter** - AI model aggregation
- **Supabase** - Backend infrastructure
- **Vercel** - Deployment platform
- **OnchainKit** - Base toolkit
- **Pinata** - IPFS infrastructure
- **Flaunch** - Memecoin deployment

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/eugenemcmillian3-tech/Degen-genz-hub-/issues)
- **Farcaster**: Contact owner FID 1378286
- **Email**: support@degenzgenhub.com (coming soon)

## 🎊 Built With Love

Created by degens, for degens. Let's make memecoin creation accessible to everyone! 🚀

---

**⚡ Powered by AI, Secured by Blockchain, Built for Degens ⚡**
