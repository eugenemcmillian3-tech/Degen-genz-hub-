import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { contestId, userId } = body;

    if (!contestId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is contest creator
    const { data: contest } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .eq('creator_id', userId)
      .single();

    if (!contest) {
      return NextResponse.json({ error: 'Unauthorized or contest not found' }, { status: 403 });
    }

    if (contest.status !== 'active') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    // Get entries with vote counts
    const { data: entries } = await supabase
      .from('contest_entries')
      .select(`
        *,
        votes:votes(count)
      `)
      .eq('contest_id', contestId);

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries found' }, { status: 400 });
    }

    // Calculate winners by vote count
    const entriesWithVotes = entries.map(entry => ({
      ...entry,
      voteCount: entry.votes?.[0]?.count || 0,
    })).sort((a, b) => b.voteCount - a.voteCount);

    const winners = entriesWithVotes.slice(0, 3); // Top 3 winners

    // Update contest status
    await supabase
      .from('contests')
      .update({ status: 'closed' })
      .eq('id', contestId);

    return NextResponse.json({
      winners: winners.map(w => ({
        entryId: w.id,
        userId: w.user_id,
        voteCount: w.voteCount,
        content: w.content,
      })),
      totalPot: contest.total_pot_usd,
    });
  } catch (error) {
    console.error('Winners selection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
