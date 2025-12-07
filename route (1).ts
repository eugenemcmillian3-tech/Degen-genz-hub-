import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Valid Base address required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning mock user');
      return NextResponse.json({
        success: true,
        user: {
          id: `base-${address.slice(0, 8)}`,
          evm_wallet: address.toLowerCase(),
          username: `base-${address.slice(0, 8)}`,
          created_at: new Date().toISOString(),
        },
        message: 'Sign in successful (demo mode)',
      });
    }

    // Check if user already exists by EVM wallet
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('evm_wallet', address.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingUser) {
      // User exists, return their data
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'Sign in successful',
      });
    }

    // Create new user with Base address
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          evm_wallet: address.toLowerCase(),
          username: `base-${address.slice(0, 8)}`,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Base sign-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
