import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { searchMarkets, getMarketNews } from '@/adjacent-api';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId, paymentId, query, platform } = await req.json();

    if (!userId || !paymentId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if payment exists and is valid (unless whitelisted)
    if (!paymentId.startsWith('WHITELIST_')) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('user_id', userId)
        .eq('feature_type', 'market_analysis')
        .eq('status', 'confirmed')
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: 'Invalid or missing payment' },
          { status: 402 }
        );
      }
    }

    // Search prediction markets
    const marketsResult = await searchMarkets({
      query,
      platform: platform || undefined,
      limit: 10,
    });

    // Get related news
    const newsResult = await getMarketNews({
      query,
      limit: 5,
    });

    // Format response
    const markets = marketsResult.markets.map(m => ({
      id: m.id,
      question: m.question,
      platform: m.platform,
      probability: Math.round(m.probability * 100),
      volume: m.volume,
      trend: m.probability > 50 ? 'up' : 'down',
    }));

    const summary = `Found ${markets.length} prediction markets related to "${query}". ${
      markets[0] ? `Top market: ${markets[0].question} (${markets[0].probability}% probability)` : ''
    }. ${newsResult.articles.length} related news articles found.`;

    // Log to ai_jobs table
    await supabase.from('ai_jobs').insert({
      user_id: userId,
      feature_type: 'market_analysis',
      model_used: 'adjacent-api',
      input_prompt: query,
      output_ref: JSON.stringify({ markets: markets.length, news: newsResult.articles.length }),
      price_usd: 1.50,
    });

    return NextResponse.json({
      markets,
      summary,
      news: newsResult.articles,
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      { error: 'Market analysis failed' },
      { status: 500 }
    );
  }
}
