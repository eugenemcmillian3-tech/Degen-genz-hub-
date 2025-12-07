import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fid INTEGER UNIQUE NOT NULL,
        username TEXT,
        evm_wallet TEXT,
        sol_wallet TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS ai_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        feature_type TEXT NOT NULL,
        model_used TEXT NOT NULL,
        input_prompt TEXT NOT NULL,
        output_ref TEXT NOT NULL,
        price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd >= 0.75 AND price_usd <= 5.0),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        chain TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        token_symbol TEXT NOT NULL,
        amount TEXT NOT NULL,
        usd_equiv NUMERIC(10, 2) NOT NULL CHECK (usd_equiv >= 0.75 AND usd_equiv <= 5.0),
        feature_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS ref_earnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
        payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
        amount_usd NUMERIC(10, 2) NOT NULL,
        paid_out BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS contests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        entry_fee_usd NUMERIC(10, 2) NOT NULL CHECK (entry_fee_usd >= 0.75 AND entry_fee_usd <= 5.0),
        platform_fee_bp INTEGER NOT NULL CHECK (platform_fee_bp >= 1000 AND platform_fee_bp <= 3000),
        status TEXT DEFAULT 'active',
        total_pot_usd NUMERIC(10, 2) DEFAULT 0,
        chain TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        ends_at TIMESTAMPTZ NOT NULL
      );`,
      
      `CREATE TABLE IF NOT EXISTS contest_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(contest_id, user_id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
        voter_id UUID NOT NULL,
        entry_id UUID REFERENCES contest_entries(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(contest_id, voter_id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS meme_packs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
    ];

    const results = [];
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', { sql: table });
      if (error && !error.message.includes('already exists')) {
        results.push({ error: error.message, table });
      } else {
        results.push({ success: true, table });
      }
    }

    return NextResponse.json({
      message: 'Database initialization attempted',
      results,
      note: 'Please ensure tables are created manually in Supabase dashboard if RPC is not enabled',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Database initialization failed',
      message: 'Please create tables manually in Supabase dashboard',
    });
  }
}
