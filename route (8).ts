import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { contestId, voterId, entryId } = body;

    if (!contestId || !voterId || !entryId) {
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

    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('contest_id', contestId)
      .eq('voter_id', voterId)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted in this contest' }, { status: 400 });
    }

    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        contest_id: contestId,
        voter_id: voterId,
        entry_id: entryId,
      })
      .select()
      .single();

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Voting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
