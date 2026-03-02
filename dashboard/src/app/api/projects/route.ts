import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query<Project>(`
      SELECT id, name, type, status, location, province, municipality,
             land_area_m2, summary, tags, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/projects] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
