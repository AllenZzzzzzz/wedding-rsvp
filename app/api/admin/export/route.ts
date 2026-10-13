import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// This route reads live data and env vars per-request; it must not be
// statically prerendered at build time (Vercel builds without your real
// SUPABASE_SERVICE_ROLE_KEY available to the build step in some setups).
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((g) => ({
    'Full Name': g.full_name,
    Attending: g.attending ? 'Yes' : 'No',
    'Plus One': g.plus_one ? 'Yes' : 'No',
    "Plus One's Name": g.plus_one_name || '',
    'Meal Preference': g.meal_preference || '',
    "Plus One's Meal": g.plus_one_meal_preference || '',
    'Dietary Restrictions': g.dietary_restrictions || '',
    'Well Wishes': g.well_wishes || '',
    Contact: g.contact || '',
    'Submitted At': new Date(g.created_at).toLocaleString('en-SG'),
    'Last Updated': new Date(g.updated_at).toLocaleString('en-SG'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 16 },
    { wch: 16 }, { wch: 26 }, { wch: 34 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest List');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="guest-list-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
    },
  });
}
