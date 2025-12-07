import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { contestId, userId, paymentId, contentType, content } = body;

    if (!contestId || !userId || !paymentId || !contentType || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .single();

    if (contestError || !contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.status !== 'active') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    if (new Date(contest.ends_at) < new Date()) {
      return NextResponse.json({ error: 'Contest has ended' }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found or unauthorized' }, { status: 403 });
    }

    if (payment.usd_equiv < contest.entry_fee_usd) {
      return NextResponse.json({ error: 'Insufficient payment amount' }, { status: 400 });
    }

    const { data: existingEntry } = await supabase
      .from('contest_entries')
      .select('*')
      .eq('contest_id', contestId)
      .eq('user_id', userId)
      .single();

    if (existingEntry) {
      return NextResponse.json({ error: 'Already entered this contest' }, { status: 400 });
    }

    const { data: entry, error: entryError } = await supabase
      .from('contest_entries')
      .insert({
        contest_id: contestId,
        user_id: userId,
        content_type: contentType,
        content,
      })
      .select()
      .single();

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }

    const newPotTotal = contest.total_pot_usd + contest.entry_fee_usd;
    await supabase
      .from('contests')
      .update({ total_pot_usd: newPotTotal })
      .eq('id', contestId);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Contest entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
