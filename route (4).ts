import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateContestEntryFee, validateContestType, validatePlatformFeeBP, validateChain } from '@/lib/validation';
import { CONTEST_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { creatorId, title, description, type, entryFeeUsd, platformFeeBp, chain, endsAt } = body;

    // Validate required fields
    if (!creatorId || !title || !type || !entryFeeUsd || !chain || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate contest type
    const typeValidation = validateContestType(type);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error }, { status: 400 });
    }

    // Validate entry fee (must be between $0.75 and $5.00)
    const feeValidation = validateContestEntryFee(entryFeeUsd);
    if (!feeValidation.valid) {
      return NextResponse.json({ error: feeValidation.error }, { status: 400 });
    }

    // Validate platform fee
    const feeBpToUse = platformFeeBp || CONTEST_CONFIG.DEFAULT_PLATFORM_FEE_BP;
    const platformFeeValidation = validatePlatformFeeBP(feeBpToUse);
    if (!platformFeeValidation.valid) {
      return NextResponse.json({ error: platformFeeValidation.error }, { status: 400 });
    }

    // Validate chain
    const chainValidation = validateChain(chain);
    if (!chainValidation.valid) {
      return NextResponse.json({ error: chainValidation.error }, { status: 400 });
    }

    // Validate end time is in the future
    if (new Date(endsAt) <= new Date()) {
      return NextResponse.json({ error: 'Contest end time must be in the future' }, { status: 400 });
    }

    // Create contest
    const { data: contest, error: insertError } = await supabase
      .from('contests')
      .insert({
        creator_id: creatorId,
        title,
        description: description || '',
        type,
        entry_fee_usd: entryFeeUsd,
        platform_fee_bp: feeBpToUse,
        status: 'open',
        total_pot_usd: 0,
        chain,
        ends_at: endsAt,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ contest });
  } catch (error) {
    console.error('Contest creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
