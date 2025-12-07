import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { contestId, creatorId } = body;

    if (!contestId || !creatorId) {
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

    if (contest.creator_id !== creatorId) {
      return NextResponse.json({ error: 'Only contest creator can close the contest' }, { status: 403 });
    }

    if (contest.status !== 'active') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    const { data: entries, error: entriesError } = await supabase
      .from('contest_entries')
      .select('*')
      .eq('contest_id', contestId);

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    const voteCounts: Record<string, number> = {};
    for (const entry of entries || []) {
      const { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('contest_id', contestId)
        .eq('entry_id', entry.id);

      voteCounts[entry.id] = votes?.length || 0;
    }

    const sortedEntries = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    const winners = sortedEntries.slice(0, 3);

    const platformFeeAmount = contest.total_pot_usd * (contest.platform_fee_bp / 10000);
    const prizePool = contest.total_pot_usd - platformFeeAmount;

    const winnerDistribution = [
      { place: 1, percentage: 0.5 },
      { place: 2, percentage: 0.3 },
      { place: 3, percentage: 0.2 },
    ];

    const results = winners.map(([entryId, voteCount], index) => ({
      entryId,
      voteCount,
      place: index + 1,
      prize: prizePool * winnerDistribution[index].percentage,
    }));

    await supabase
      .from('contests')
      .update({ status: 'closed' })
      .eq('id', contestId);

    return NextResponse.json({
      contest,
      results,
      platformFee: platformFeeAmount,
      prizePool,
    });
  } catch (error) {
    console.error('Contest close error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
