import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const contestId = request.nextUrl.searchParams.get('contestId');

    if (!contestId) {
      return NextResponse.json({ error: 'Contest ID required' }, { status: 400 });
    }

    const { data: entries, error } = await supabase
      .from('contest_entries')
      .select(`
        *,
        user:users!contest_entries_user_id_fkey(fid, username),
        votes:votes(count)
      `)
      .eq('contest_id', contestId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entriesWithVotes = entries?.map(entry => ({
      ...entry,
      voteCount: entry.votes?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({ entries: entriesWithVotes });
  } catch (error) {
    console.error('Entries fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
