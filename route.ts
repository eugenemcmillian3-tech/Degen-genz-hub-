import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { OPENROUTER_MODELS, FEATURE_PRICING } from '@/types/app';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// System prompts for each feature type
const FEATURE_PROMPTS: Record<string, string> = {
  memecoin_quick: `You are a viral memecoin concept generator for Farcaster and Base. Generate a quick memecoin concept with:
- Ticker (3-5 chars)
- Token name
- Short backstory (2-3 sentences)
- Tagline (catchy one-liner)
- 3 viral Farcaster cast hooks

Format as JSON with keys: ticker, name, backstory, tagline, castHooks (array)`,
  
  memecoin_full: `You are an expert memecoin launch strategist for Farcaster and Base. Generate a comprehensive memecoin launch pack with:
- Ticker and token name
- Detailed lore thread (10-20 casts)
- Website copy outline (hero, about, tokenomics)
- Tokenomics ideas (supply, distribution, mechanics)
- Launch CTAs (call-to-actions for social)

Format as detailed JSON with all sections.`,
  
  memecoin_helpers: `You are a crypto launch consultant for Base and Farcaster. Generate onchain helper content:
- Token launch checklist (step-by-step)
- Tweetstorm text (10 tweets)
- Farcaster caststorm text (10 casts)

Format as JSON with keys: checklist (array), tweetstorm (array), caststorm (array)`,
  
  nft_idea: `You are a viral NFT concept designer for Farcaster and Base. Generate an NFT collection idea:
- Collection title
- Description (3-4 sentences)
- Lore/story
- Trait ideas (5-7 traits)
- Cast copy for announcement

Format as JSON with keys: title, description, lore, traits (array), castCopy`,
  
  meme_pack: `You are a viral meme content creator for Farcaster degens. Generate a meme content pack:
- 5-10 viral-style Farcaster cast ideas
- Twitter/X caption variations
- Trending crypto/memecoin angles

Format as JSON with keys: farcasterCasts (array), twitterCaptions (array), angles (array)`,
  
  viral_scout: `You are a trending crypto/memecoin researcher for degens. Analyze the given topic and provide:
- 5 degen takes on the trend
- 5 Farcaster cast ideas based on the trend
- Key talking points

Format as JSON with keys: degenTakes (array), castIdeas (array), talkingPoints (array)`,
  
  narrative_report: `You are a deep crypto narrative analyst for Farcaster degens. Provide a comprehensive narrative report:
- Executive summary
- 5-10 content angles for Farcaster/Twitter
- Key insights and opportunities
- Actionable next steps

Format as JSON with keys: summary, contentAngles (array), insights (array), nextSteps (array)`,
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, paymentId, featureType, model, userPrompt } = body;

    // Validate required fields
    if (!userId || !paymentId || !featureType || !model || !userPrompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate model is in allowlist
    if (!OPENROUTER_MODELS.includes(model as typeof OPENROUTER_MODELS[number])) {
      return NextResponse.json({ error: 'Invalid model. Only free OpenRouter models are allowed.' }, { status: 400 });
    }

    // Validate OpenRouter API key is configured
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Verify payment exists and belongs to user
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found or unauthorized' }, { status: 403 });
    }

    // Verify payment status is confirmed
    if (payment.status !== 'confirmed' && payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment must be confirmed before AI generation' }, { status: 400 });
    }

    // Validate pricing matches feature type
    const pricing = FEATURE_PRICING[featureType as keyof typeof FEATURE_PRICING];
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid feature type' }, { status: 400 });
    }

    if (payment.usd_equiv < pricing.min || payment.usd_equiv > pricing.max) {
      return NextResponse.json({ 
        error: `Payment amount ($${payment.usd_equiv}) does not match feature pricing ($${pricing.min}-$${pricing.max})` 
      }, { status: 400 });
    }

    // Get system prompt for feature type
    const systemPrompt = FEATURE_PROMPTS[featureType as keyof typeof FEATURE_PROMPTS] || FEATURE_PROMPTS['memecoin_quick'];

    // Call OpenRouter API directly (server-side only)
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const output = aiData.choices?.[0]?.message?.content || 'No output generated';

    // Store AI job in database
    const { data: aiJob, error: jobError } = await supabase
      .from('ai_jobs')
      .insert({
        user_id: userId,
        feature_type: featureType,
        model_used: model,
        input_prompt: userPrompt,
        output_ref: output,
        price_usd: payment.usd_equiv,
      })
      .select()
      .single();

    if (jobError) {
      console.error('AI job insert error:', jobError);
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    // Store meme pack if applicable
    if (featureType.includes('meme') || featureType.includes('nft')) {
      try {
        const parsedData = JSON.parse(output);
        await supabase.from('meme_packs').insert({
          user_id: userId,
          category: featureType,
          title: `${featureType}_${Date.now()}`,
          data: parsedData,
        });
      } catch (e) {
        // If output is not valid JSON, store as text
        await supabase.from('meme_packs').insert({
          user_id: userId,
          category: featureType,
          title: `${featureType}_${Date.now()}`,
          data: { raw: output },
        });
      }
    }

    return NextResponse.json({
      id: aiJob.id,
      output,
      model,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
