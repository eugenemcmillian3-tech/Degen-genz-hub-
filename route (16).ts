import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FEATURE_PRICING, SUPPORTED_CHAINS } from '@/types/app';
import { GLOBAL_PRICING, CHAIN_CONFIG, REFERRAL_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, chain, txHash, tokenSymbol, amount, usdEquiv, featureType, referralCode } = body;

    // Validate required fields
    if (!userId || !chain || !txHash || !tokenSymbol || !amount || !usdEquiv || !featureType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate chain is supported
    if (!SUPPORTED_CHAINS.includes(chain as typeof SUPPORTED_CHAINS[number])) {
      return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
    }

    // Validate global pricing constraints
    if (usdEquiv < GLOBAL_PRICING.MIN_USD || usdEquiv > GLOBAL_PRICING.MAX_USD) {
      return NextResponse.json(
        { error: `All payments must be between $${GLOBAL_PRICING.MIN_USD} and $${GLOBAL_PRICING.MAX_USD}` },
        { status: 400 }
      );
    }

    // Validate feature-specific pricing
    const pricing = FEATURE_PRICING[featureType as keyof typeof FEATURE_PRICING];
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid feature type' }, { status: 400 });
    }

    if (usdEquiv < pricing.min || usdEquiv > pricing.max) {
      return NextResponse.json(
        { error: `${featureType} price must be between $${pricing.min} and $${pricing.max}` },
        { status: 400 }
      );
    }

    // Check for duplicate transaction hash
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      return NextResponse.json({ error: 'Transaction already recorded' }, { status: 400 });
    }

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        chain,
        tx_hash: txHash,
        token_symbol: tokenSymbol,
        amount,
        usd_equiv: usdEquiv,
        feature_type: featureType,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Process referral commission if referral code provided
    if (referralCode) {
      const { data: referral } = await supabase
        .from('referrals')
        .select('user_id')
        .eq('code', referralCode)
        .single();

      if (referral && referral.user_id !== userId) {
        const commissionAmount = usdEquiv * REFERRAL_CONFIG.DEFAULT_COMMISSION_PERCENT;

        await supabase.from('ref_earnings').insert({
          referrer_id: referral.user_id,
          referred_id: userId,
          payment_id: payment.id,
          amount_usd: commissionAmount,
          paid_out: false,
        });
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
