import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { launchMemecoin, pollLaunchStatus } from '@/flaunch-api';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId, paymentId, name, ticker, description, imageUrl, initialLiquidityEth } = await req.json();

    if (!userId || !paymentId || !name || !ticker || !description) {
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
        .eq('feature_type', 'memecoin_launch')
        .eq('status', 'confirmed')
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: 'Invalid or missing payment' },
          { status: 402 }
        );
      }
    }

    // Launch memecoin via Flaunch
    const launchResult = await launchMemecoin({
      name,
      symbol: ticker,
      description,
      imageUrl,
      initialLiquidityEth: initialLiquidityEth || 0.1,
    });

    // Poll for status (wait up to 30 seconds)
    let status = 'pending';
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResult = await pollLaunchStatus(launchResult.launchId);
      status = statusResult.status;
      if (status === 'completed' || status === 'failed') {
        break;
      }
    }

    // Log to ai_jobs table
    await supabase.from('ai_jobs').insert({
      user_id: userId,
      feature_type: 'memecoin_launch',
      model_used: 'flaunch-api',
      input_prompt: `${name} (${ticker})`,
      output_ref: launchResult.tokenAddress,
      price_usd: 4.00,
    });

    return NextResponse.json({
      tokenAddress: launchResult.tokenAddress,
      launchId: launchResult.launchId,
      status,
      explorerUrl: `https://basescan.org/token/${launchResult.tokenAddress}`,
    });
  } catch (error) {
    console.error('Memecoin launch error:', error);
    return NextResponse.json(
      { error: 'Memecoin launch failed' },
      { status: 500 }
    );
  }
}
