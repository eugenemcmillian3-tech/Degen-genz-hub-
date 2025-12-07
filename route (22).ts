import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTokenPrice } from '@/0x-api';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId, paymentId, tokenAddress, chain } = await req.json();

    if (!userId || !paymentId || !tokenAddress || !chain) {
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
        .eq('feature_type', 'token_price')
        .eq('status', 'confirmed')
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: 'Invalid or missing payment' },
          { status: 402 }
        );
      }
    }

    // Get token price from 0x API
    const priceData = await getTokenPrice(tokenAddress, chain);

    // Format response
    const result = {
      symbol: priceData.symbol,
      price: priceData.price.toFixed(6),
      change24h: priceData.priceChange24h || 0,
      high24h: priceData.high24h?.toFixed(6) || priceData.price.toFixed(6),
      low24h: priceData.low24h?.toFixed(6) || priceData.price.toFixed(6),
      volume24h: (priceData.volume24h || 0).toLocaleString(),
      marketCap: (priceData.marketCap || 0).toLocaleString(),
      chain,
      lastUpdate: new Date().toISOString(),
    };

    // Log to ai_jobs table
    await supabase.from('ai_jobs').insert({
      user_id: userId,
      feature_type: 'token_price',
      model_used: '0x-api',
      input_prompt: `${tokenAddress} on ${chain}`,
      output_ref: JSON.stringify(result),
      price_usd: 0.75,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Token price error:', error);
    return NextResponse.json(
      { error: 'Token price lookup failed' },
      { status: 500 }
    );
  }
}
