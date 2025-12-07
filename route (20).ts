import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user already has a code
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ code: existing.code, id: existing.id });
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: collision } = await supabase
        .from('referrals')
        .select('id')
        .eq('code', code)
        .single();

      if (!collision) break;
      code = generateCode();
      attempts++;
    }

    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({ user_id: userId, code })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: referral.code, id: referral.id });
  } catch (error) {
    console.error('Referral generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
