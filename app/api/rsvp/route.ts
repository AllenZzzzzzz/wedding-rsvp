import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findPossibleDuplicates } from '@/lib/fuzzyMatch';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    full_name,
    attending,
    plus_one,
    plus_one_name,
    meal_preference,
    plus_one_meal_preference,
    dietary_restrictions,
    well_wishes,
    contact,
    force,
  } = body;

  if (!full_name || typeof attending !== 'boolean') {
    return NextResponse.json(
      { error: 'Name and attendance are required.' },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  if (!force) {
    const { data: existing, error: fetchError } = await supabase
      .from('guests')
      .select('id, full_name');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const dups = findPossibleDuplicates(full_name, existing || []);
    if (dups.length > 0) {
      return NextResponse.json(
        { possibleDuplicate: { id: dups[0].id, full_name: dups[0].full_name } },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase.from('guests').insert({
    full_name,
    attending,
    plus_one: !!plus_one,
    plus_one_name: plus_one_name || null,
    meal_preference: meal_preference || null,
    plus_one_meal_preference: plus_one_meal_preference || null,
    dietary_restrictions: dietary_restrictions || null,
    well_wishes: well_wishes || null,
    contact: contact || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
