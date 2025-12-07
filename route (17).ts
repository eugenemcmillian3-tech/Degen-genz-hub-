import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Payment verification endpoint
 * Checks if a payment exists and is confirmed for a specific feature
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, txHash, featureType } = body;

    if (!userId || !txHash || !featureType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find payment by transaction hash
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('tx_hash', txHash)
      .eq('user_id', userId)
      .eq('feature_type', featureType)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ 
        verified: false,
        error: 'Payment not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      verified: payment.status === 'confirmed',
      payment,
      status: payment.status,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
