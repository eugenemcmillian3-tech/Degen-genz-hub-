# DEGENZ GEN/Z HUB - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run `SUPABASE_SETUP.sql` in SQL Editor (sets up all tables, constraints, indexes, functions)
- [ ] Verify all 9 tables are created:
  - [ ] users
  - [ ] ai_jobs
  - [ ] payments
  - [ ] referrals
  - [ ] ref_earnings
  - [ ] contests
  - [ ] contest_entries
  - [ ] votes
  - [ ] meme_packs
- [ ] Copy Supabase URL and anon key

### 2. OpenRouter Setup
- [ ] Sign up at [openrouter.ai](https://openrouter.ai)
- [ ] Generate API key
- [ ] Verify access to free models (18 models available)

### 3. Environment Variables
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
NEXT_PUBLIC_HOST=https://yourdomain.com
```

### 4. Firecrawl (Optional for Web Scraping)
- [ ] Sign up at [firecrawl.dev](https://firecrawl.dev)
- [ ] Get API key (already configured in code)
- [ ] Test viral scout feature

### 5. Test Locally
```bash
npm run dev
```
- [ ] App loads without errors
- [ ] Farcaster authentication works
- [ ] All feature cards display correctly
- [ ] Payment modal shows multi-chain options

## 🚀 Deployment Steps

### Deploy to Vercel

1. **Connect Repository**
   - [ ] Push code to GitHub
   - [ ] Connect repository to Vercel
   - [ ] Import project

2. **Configure Environment Variables**
   Add all env vars from `.env.local`:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `OPENROUTER_API_KEY`
   - [ ] `NEXT_PUBLIC_HOST` (set to your Vercel URL)

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```
   - [ ] Deployment successful
   - [ ] No build errors
   - [ ] All routes accessible

4. **Update Environment**
   - [ ] Update `NEXT_PUBLIC_HOST` with production URL
   - [ ] Redeploy

## 📱 Farcaster Mini-App Registration

### Register Your Mini-App

1. **Access Farcaster Mini-Apps**
   - [ ] Go to [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz)
   - [ ] Connect with your Farcaster account

2. **Register App**
   - [ ] App Name: "DEGENZ GEN/Z HUB"
   - [ ] URL: Your Vercel deployment URL
   - [ ] Description: "AI-powered memecoin, NFT, and viral content generator"
   - [ ] Icon: Upload app icon
   - [ ] Submit registration

3. **Verify Manifest**
   - [ ] Check `https://yourdomain.com/.well-known/farcaster.json`
   - [ ] Verify manifest loads correctly
   - [ ] Test frame metadata

## 🧪 Post-Deployment Testing

### Test All Features

#### Authentication
- [ ] Farcaster Quick Auth works
- [ ] User profile displays correct FID
- [ ] User data persists in Supabase

#### AI Generation
- [ ] Quick memecoin concept generates ($0.75-$1.50)
- [ ] Full memecoin pack generates ($3.00-$5.00)
- [ ] NFT ideas generate ($0.75-$1.50)
- [ ] Meme packs generate ($1.00-$3.00)
- [ ] Viral scout works ($0.75-$2.00)
- [ ] Narrative report generates ($3.00-$5.00)
- [ ] All 18 free models selectable

#### Payment Flow
- [ ] Multi-chain modal shows all 8 chains
- [ ] Payment addresses display correctly
- [ ] Transaction hash validation works
- [ ] Payment records in Supabase

#### Contests
- [ ] Create contest works (fee $0.75-$5.00)
- [ ] Browse contests displays active contests
- [ ] Enter contest works
- [ ] Voting works (1 vote per FID)
- [ ] Winner calculation works

#### Referrals
- [ ] Generate referral code works
- [ ] Referral tracking works
- [ ] Commission calculation correct (10%)
- [ ] Earnings display correctly

#### Profile
- [ ] Stats display correctly
- [ ] Activity history shows recent actions
- [ ] AI jobs tab shows generation history
- [ ] Contests tab shows entries
- [ ] Meme packs library works

### Test on Mobile
- [ ] App loads on mobile browsers
- [ ] Responsive design works
- [ ] All modals display correctly
- [ ] Farcaster integration works on mobile

### Test in Farcaster
- [ ] Open app in Warpcast
- [ ] Mini-app loads correctly
- [ ] Authentication works
- [ ] All features accessible
- [ ] Share to cast works

## 🔒 Security Checklist

### API Security
- [ ] All routes validate authentication
- [ ] Payment amounts validated server-side
- [ ] Model allowlist enforced
- [ ] Pricing constraints enforced
- [ ] No sensitive data exposed to client

### Database Security
- [ ] Supabase RLS policies considered (optional)
- [ ] Foreign key constraints in place
- [ ] Proper indexes for performance
- [ ] Check constraints on all money fields

### Environment Security
- [ ] All API keys in environment variables
- [ ] No hardcoded secrets in code
- [ ] `.env.local` in `.gitignore`
- [ ] Production keys different from dev

## 📊 Monitoring Setup

### Post-Launch Monitoring
- [ ] Set up Vercel analytics
- [ ] Monitor API error rates
- [ ] Track user signups
- [ ] Monitor payment success rates
- [ ] Check AI generation success rates

### User Feedback
- [ ] Set up user feedback channel
- [ ] Monitor social media mentions
- [ ] Track feature usage
- [ ] Identify popular AI models

## 🐛 Known Issues & Workarounds

### Payment Verification
**Issue**: Transaction hash validation not implemented
**Workaround**: Manual verification via blockchain explorer
**TODO**: Implement RPC-based verification

### Prize Distribution
**Issue**: Manual prize distribution
**Workaround**: Use contest winner calculation API
**TODO**: Implement smart contract distribution

### Web Scraping Rate Limits
**Issue**: Firecrawl has rate limits
**Workaround**: Cache results, implement retry logic
**TODO**: Add caching layer

## 🎯 Launch Day Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations complete
- [ ] All env vars set
- [ ] Monitoring enabled
- [ ] Backup plan ready
- [ ] Support channel set up
- [ ] Social media posts prepared
- [ ] Announcement cast ready
- [ ] Team notified

## 📈 Post-Launch Tasks

### Week 1
- [ ] Monitor error rates
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Update documentation

### Month 1
- [ ] Analyze user behavior
- [ ] Add requested features
- [ ] Optimize costs
- [ ] Improve AI prompts
- [ ] Add more AI models if requested

### Ongoing
- [ ] Regular database backups
- [ ] Security updates
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] Community engagement

---

## 🆘 Troubleshooting

### App Won't Load
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase connection
4. Verify deployment logs

### AI Generation Fails
1. Check OpenRouter API key
2. Verify model is in allowlist
3. Check payment validation
4. Review API logs

### Payment Issues
1. Verify chain is supported
2. Check transaction hash format
3. Verify USD amount in range
4. Check Supabase logs

### Contest Issues
1. Verify entry fee in range ($0.75-$5.00)
2. Check contest end time
3. Verify user hasn't entered already
4. Check voting constraints

---

## 📞 Support

For issues during deployment:
- Check [Supabase Docs](https://supabase.com/docs)
- Check [Vercel Docs](https://vercel.com/docs)
- Check [OpenRouter Docs](https://openrouter.ai/docs)
- Contact owner (FID 1378286)

---

**Last Updated**: 2025-12-06
**Version**: 1.0.0
