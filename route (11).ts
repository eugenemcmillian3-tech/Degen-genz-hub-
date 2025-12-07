import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId, paymentId, content, mediaUrl } = await req.json();

    if (!userId || !paymentId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if payment exists and is valid (unless whitelisted)
    if (!paymentId.startsWith('WHITELIST_')) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('user_id', userId)
        .eq('feature_type', 'lens_post')
        .eq('status', 'confirmed')
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: 'Invalid or missing payment' },
          { status: 402 }
        );
      }
    }

    // In production, you would:
    // 1. Initialize Lens Protocol SDK
    // 2. Create post with content and optional media
    // 3. Submit transaction to publish onchain
    // 4. Return post ID and transaction hash
    
    // For now, return mock post result
    const mockPostId = `0x${Math.random().toString(16).slice(2, 18)}`;
    const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;

    // Log to ai_jobs table
    await supabase.from('ai_jobs').insert({
      user_id: userId,
      feature_type: 'lens_post',
      model_used: 'lens-protocol',
      input_prompt: content.slice(0, 100),
      output_ref: mockPostId,
      price_usd: 2.00,
    });

    return NextResponse.json({
      postId: mockPostId,
      transactionHash: mockTxHash,
      lensUrl: `https://hey.xyz/posts/${mockPostId}`,
      status: 'published',
    });
  } catch (error) {
    console.error('Lens post error:', error);
    return NextResponse.json(
      { error: 'Lens post failed' },
      { status: 500 }
    );
  }
}
