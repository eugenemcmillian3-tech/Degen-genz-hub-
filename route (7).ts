import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'active';

    const { data: contests, error } = await supabase
      .from('contests')
      .select(`
        *,
        creator:users!contests_creator_id_fkey(fid, username),
        entries:contest_entries(count)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contests: contests || [] });
  } catch (error) {
    console.error('Contest list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
