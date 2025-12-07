import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId, recipientAddress, message } = await req.json();

    if (!userId || !recipientAddress || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // In production, you would:
    // 1. Use XMTP client to send message
    // 2. Store message in conversation
    // 3. Return confirmation
    
    // For now, return mock sent message
    return NextResponse.json({
      message: {
        id: `msg_${Date.now()}`,
        sender: userId,
        content: message,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('XMTP send error:', error);
    return NextResponse.json(
      { error: 'Message send failed' },
      { status: 500 }
    );
  }
}
