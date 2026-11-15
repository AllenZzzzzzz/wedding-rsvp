import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ guests: data });
}

const EDITABLE_FIELDS = [
  'full_name',
  'attending',
  'plus_one',
  'plus_one_name',
  'meal_preference',
  'plus_one_meal_preference',
  'dietary_restrictions',
  'well_wishes',
  'contact',
] as const;

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  // Only send columns that are safe to edit. The table also has generated and
  // system columns (full_name_normalized, created_at, ...) that Postgres
  // rejects updates to, which made every edit fail.
  const updates: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in body) {
      const value = body[key];
      updates[key] = typeof value === 'string' && value.trim() === '' && key !== 'full_name' ? null : value;
    }
  }
  if (typeof updates.full_name === 'string' && !updates.full_name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('guests').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
