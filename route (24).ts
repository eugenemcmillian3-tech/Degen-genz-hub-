import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Get AI jobs
    const { data: aiJobs } = await supabase
      .from('ai_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get meme packs
    const { data: memePacks } = await supabase
      .from('meme_packs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get contests created
    const { data: contestsCreated } = await supabase
      .from('contests')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    // Get contest entries
    const { data: contestEntries } = await supabase
      .from('contest_entries')
      .select(`
        *,
        contest:contests(title, status),
        votes:votes(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get referral stats
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: earnings } = await supabase
      .from('ref_earnings')
      .select('amount_usd')
      .eq('referrer_id', userId);

    const totalSpent = payments?.reduce((sum, p) => sum + (p.usd_equiv || 0), 0) || 0;
    const totalEarned = earnings?.reduce((sum, e) => sum + (e.amount_usd || 0), 0) || 0;

    return NextResponse.json({
      user,
      stats: {
        totalSpent,
        totalEarned,
        aiJobsCount: aiJobs?.length || 0,
        contestsCreated: contestsCreated?.length || 0,
        contestsEntered: contestEntries?.length || 0,
        memePacksCreated: memePacks?.length || 0,
      },
      recentActivity: {
        aiJobs: aiJobs || [],
        payments: payments || [],
        memePacks: memePacks || [],
        contestEntries: contestEntries || [],
      },
      referralCode: referral?.code || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
