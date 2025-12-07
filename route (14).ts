import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isUserWhitelisted } from '@/lib/whitelist';
import { uploadToPinata, createNFTMetadata } from '@/pinata-media-api';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const paymentId = formData.get('paymentId') as string;
    const attributesStr = formData.get('attributes') as string | null;

    if (!file || !name || !description || !userId || !paymentId) {
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
        .eq('feature_type', 'nft_mint')
        .eq('status', 'confirmed')
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: 'Invalid or missing payment' },
          { status: 402 }
        );
      }
    }

    // Parse attributes if provided
    let attributes = undefined;
    if (attributesStr) {
      try {
        attributes = JSON.parse(attributesStr);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid attributes JSON' },
          { status: 400 }
        );
      }
    }

    // Upload image to Pinata
    const imageResult = await uploadToPinata(file);

    // Create NFT metadata
    const metadataResult = await createNFTMetadata({
      name,
      description,
      imageUri: imageResult.ipfsUri,
      attributes,
    });

    // Log to ai_jobs table
    await supabase.from('ai_jobs').insert({
      user_id: userId,
      feature_type: 'nft_mint',
      model_used: 'pinata-ipfs',
      input_prompt: `NFT: ${name}`,
      output_ref: metadataResult.metadataUri,
      price_usd: 2.50,
    });

    return NextResponse.json({
      ipfsUri: imageResult.ipfsUri,
      gatewayUrl: imageResult.gatewayUrl,
      metadataUri: metadataResult.metadataUri,
      metadataGatewayUrl: metadataResult.metadataGatewayUrl,
    });
  } catch (error) {
    console.error('NFT mint error:', error);
    return NextResponse.json(
      { error: 'NFT minting failed' },
      { status: 500 }
    );
  }
}
