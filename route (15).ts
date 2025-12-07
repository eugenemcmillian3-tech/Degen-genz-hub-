import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { validateGlobalPricing, validateChain } from '@/lib/validation';
import { isWhitelisted, createWhitelistPaymentId } from '@/lib/whitelist';

/**
 * POST /api/payments/base-pay
 * Handle Base Pay payments (from Base Builder accounts)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, txHash, tokenSymbol, amount, usdEquiv, featureType, chain } = body;

    // Validation
    if (!userId || !txHash || !tokenSymbol || !amount || !usdEquiv || !featureType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate pricing
    const pricingValidation = validateGlobalPricing(usdEquiv, featureType);
    if (!pricingValidation.valid) {
      return NextResponse.json(
        { error: pricingValidation.error },
        { status: 400 }
      );
    }

    // Validate chain (Base Pay only works on Base)
    const chainValidation = validateChain(chain || 'Base');
    if (!chainValidation.valid) {
      return NextResponse.json(
        { error: chainValidation.error },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user is whitelisted (for testing)
    const whitelisted = await isWhitelisted(userId);
    
    // Check for duplicate transaction
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      );
    }

    // Insert payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        chain: chain || 'Base',
        tx_hash: txHash,
        token_symbol: tokenSymbol,
        amount,
        usd_equiv: usdEquiv,
        feature_type: featureType,
        status: whitelisted ? 'confirmed' : 'pending', // Whitelisted = instant confirm
      })
      .select()
      .single();

    if (error) {
      console.error('Payment insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // Process referral if applicable
    const { data: referralData } = await supabase
      .from('referrals')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (referralData) {
      const commissionAmount = usdEquiv * 0.10; // 10% default commission
      
      await supabase.from('ref_earnings').insert({
        referrer_id: referralData.user_id,
        referred_id: userId,
        payment_id: payment.id,
        amount_usd: commissionAmount,
        paid_out: false,
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        txHash: payment.tx_hash,
        usdEquiv: payment.usd_equiv,
      },
    });
  } catch (error) {
    console.error('Base Pay API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
