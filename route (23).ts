import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { fid, username, evm_wallet, sol_wallet } = body;

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning mock user');
      return NextResponse.json({
        user: {
          id: `fid-${fid}`,
          fid,
          username: username || `user-${fid}`,
          evm_wallet: evm_wallet || null,
          sol_wallet: sol_wallet || null,
          created_at: new Date().toISOString(),
        },
      });
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('fid', fid)
      .single();

    if (existingUser && !fetchError) {
      const updates: Record<string, string> = {};
      if (username) {
        updates['username'] = username;
      }
      if (evm_wallet) {
        updates['evm_wallet'] = evm_wallet;
      }
      if (sol_wallet) {
        updates['sol_wallet'] = sol_wallet;
      }

      if (Object.keys(updates).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return NextResponse.json({ user: existingUser });
        }

        return NextResponse.json({ user: updatedUser });
      }

      return NextResponse.json({ user: existingUser });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        fid,
        username: username || null,
        evm_wallet: evm_wallet || null,
        sol_wallet: sol_wallet || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Return mock user if database insert fails
      return NextResponse.json({
        user: {
          id: `fid-${fid}`,
          fid,
          username: username || `user-${fid}`,
          evm_wallet: evm_wallet || null,
          sol_wallet: sol_wallet || null,
          created_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error('User upsert error:', error);
    // Return generic mock user on catastrophic failure
    return NextResponse.json({
      user: {
        id: 'error-user-id',
        fid: 999999,
        username: 'error-user',
        created_at: new Date().toISOString(),
      },
    });
  }
}
