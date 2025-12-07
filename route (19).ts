import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data: earnings, error } = await supabase
      .from('ref_earnings')
      .select(`
        *,
        referred:users!ref_earnings_referred_id_fkey(id, fid, username),
        payment:payments!ref_earnings_payment_id_fkey(usd_equiv, feature_type, created_at)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalEarned = earnings?.reduce((sum, e) => sum + (e.amount_usd || 0), 0) || 0;
    const totalPaidOut = earnings?.filter(e => e.paid_out).reduce((sum, e) => sum + (e.amount_usd || 0), 0) || 0;

    return NextResponse.json({
      earnings: earnings || [],
      totalEarned,
      totalPaidOut,
      pending: totalEarned - totalPaidOut,
    });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
