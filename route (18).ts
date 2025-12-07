import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Payment webhook endpoint for external payment processors or manual verification
 * 
 * This endpoint updates payment status after blockchain confirmation.
 * In production, you would:
 * 1. Verify the signature from your payment processor
 * 2. Query blockchain RPC to confirm transaction
 * 3. Update payment status to 'confirmed'
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { txHash, status, signature } = body;

    if (!txHash || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Verify signature/authentication
    // TODO: Query blockchain RPC to verify transaction exists and matches amount

    // Update payment status
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ status })
      .eq('tx_hash', txHash)
      .select()
      .single();

    if (updateError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If confirmed, update contest pot if applicable
    if (status === 'confirmed' && payment.feature_type.startsWith('contest_entry_')) {
      const contestId = payment.feature_type.replace('contest_entry_', '');
      await supabase.rpc('increment_contest_pot', {
        contest_id: parseInt(contestId),
        amount: payment.usd_equiv,
      });
    }

    return NextResponse.json({ 
      success: true,
      payment 
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Manual payment confirmation endpoint
 * For testing and manual verification
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { paymentId, status } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      payment 
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
