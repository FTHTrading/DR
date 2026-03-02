import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type {
  Project,
  ProjectMetric,
  Permit,
  PPA,
  FundingPathway,
  Counterparty,
  ProjectDetail,
} from '@/lib/types';

export function generateStaticParams() {
  return [{ id: 'sunfarm-bani' }, { id: 'cabrera-eco' }];
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const [projects, metrics, permits, ppas, pathways, counterparties] =
      await Promise.all([
        query<Project>(
          `SELECT id, name, type, status, location, province, municipality,
                  land_area_m2, summary, tags, created_at, updated_at
           FROM projects WHERE id = $1`,
          [projectId]
        ),
        query<ProjectMetric>(
          `SELECT metric_key, value_num, value_text, unit, source_doc
           FROM project_metrics WHERE project_id = $1
           ORDER BY metric_key`,
          [projectId]
        ),
        query<Permit>(
          `SELECT id, permit_type, authority, status, doc_hash, granted_at, notes
           FROM permits WHERE project_id = $1
           ORDER BY permit_type`,
          [projectId]
        ),
        query<PPA>(
          `SELECT id, offtaker, price_usd_mwh, escalation_pct, term_years,
                  capacity_mw, status, notes
           FROM ppas WHERE project_id = $1
           ORDER BY created_at`,
          [projectId]
        ),
        query<FundingPathway>(
          `SELECT id, pathway, label, target_usd, status, institution, next_action, notes
           FROM funding_pathways WHERE project_id = $1
           ORDER BY pathway`,
          [projectId]
        ),
        query<Counterparty>(
          `SELECT id, name, role, entity_type, status
           FROM counterparties WHERE project_id = $1
           ORDER BY role`,
          [projectId]
        ),
      ]);

    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const detail: ProjectDetail = {
      project: projects[0],
      metrics,
      permits,
      ppas,
      funding_pathways: pathways,
      counterparties,
    };

    return NextResponse.json(detail);
  } catch (err) {
    console.error(`[api/projects/${params.id}] error`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
