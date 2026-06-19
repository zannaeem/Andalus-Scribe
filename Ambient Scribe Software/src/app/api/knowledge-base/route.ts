import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { mockKnowledgeBase } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(mockKnowledgeBase);
  }

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, content, source_type, category, tags, usage_count, created_at, updated_at')
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clinicId, title, content, sourceType = 'manual_entry', category = 'general', tags = [] } = body;

  if (!clinicId || !title || !content) {
    return NextResponse.json({ error: 'clinicId, title, and content required' }, { status: 400 });
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString();
    return NextResponse.json({
      id: `kb-mock-${Date.now()}`, clinic_id: clinicId, title, content,
      source_type: sourceType, category, tags, usage_count: 0, created_at: now, updated_at: now,
    }, { status: 201 });
  }

  // Generate embedding for vector search
  const embedding = await generateEmbedding(`${title}\n\n${content}`);

  const { data, error } = await supabase
    .from('knowledge_base')
    .insert({ clinic_id: clinicId, title, content, embedding, source_type: sourceType, category, tags })
    .select('id, title, content, source_type, category, tags, usage_count, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, title, content, category, tags } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ success: true });
  }

  const updates: Record<string, unknown> = { category, tags };
  if (title) updates.title = title;
  if (content) {
    updates.content = content;
    updates.embedding = await generateEmbedding(`${title ?? ''}\n\n${content}`);
  }

  const { error } = await supabase.from('knowledge_base').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
