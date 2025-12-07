export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          fid: number;
          username: string | null;
          evm_wallet: string | null;
          sol_wallet: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fid: number;
          username?: string | null;
          evm_wallet?: string | null;
          sol_wallet?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fid?: number;
          username?: string | null;
          evm_wallet?: string | null;
          sol_wallet?: string | null;
          created_at?: string;
        };
      };
      ai_jobs: {
        Row: {
          id: string;
          user_id: string;
          feature_type: string;
          model_used: string;
          input_prompt: string;
          output_ref: string;
          price_usd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature_type: string;
          model_used: string;
          input_prompt: string;
          output_ref: string;
          price_usd: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          feature_type?: string;
          model_used?: string;
          input_prompt?: string;
          output_ref?: string;
          price_usd?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          chain: string;
          tx_hash: string;
          token_symbol: string;
          amount: string;
          usd_equiv: number;
          feature_type: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chain: string;
          tx_hash: string;
          token_symbol: string;
          amount: string;
          usd_equiv: number;
          feature_type: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          chain?: string;
          tx_hash?: string;
          token_symbol?: string;
          amount?: string;
          usd_equiv?: number;
          feature_type?: string;
          status?: string;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          created_at?: string;
        };
      };
      ref_earnings: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          payment_id: string;
          amount_usd: number;
          paid_out: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          payment_id: string;
          amount_usd: number;
          paid_out?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          payment_id?: string;
          amount_usd?: number;
          paid_out?: boolean;
          created_at?: string;
        };
      };
      contests: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          type: string;
          entry_fee_usd: number;
          platform_fee_bp: number;
          status: string;
          total_pot_usd: number;
          chain: string;
          created_at: string;
          ends_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          type: string;
          entry_fee_usd: number;
          platform_fee_bp: number;
          status?: string;
          total_pot_usd?: number;
          chain: string;
          created_at?: string;
          ends_at: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          type?: string;
          entry_fee_usd?: number;
          platform_fee_bp?: number;
          status?: string;
          total_pot_usd?: number;
          chain?: string;
          created_at?: string;
          ends_at?: string;
        };
      };
      contest_entries: {
        Row: {
          id: string;
          contest_id: string;
          user_id: string;
          content_type: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          user_id: string;
          content_type: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contest_id?: string;
          user_id?: string;
          content_type?: string;
          content?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          contest_id: string;
          voter_id: string;
          entry_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          voter_id: string;
          entry_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contest_id?: string;
          voter_id?: string;
          entry_id?: string;
          created_at?: string;
        };
      };
      meme_packs: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          data_json: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          data_json: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          data_json?: string;
          created_at?: string;
        };
      };
    };
  };
}
