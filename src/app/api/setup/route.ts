import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_REF = 'luedxfwcfnkoigubocrn';

const MIGRATION_SQL = `
ALTER TABLE maker_profiles
  ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promo_headline TEXT,
  ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

CREATE INDEX IF NOT EXISTS maker_profiles_promoted_idx
  ON maker_profiles (promoted_at DESC NULLS LAST)
  WHERE is_promoted = TRUE;
`;

async function runSql(query: string, accessToken: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SQL failed (${res.status}): ${text}`);
  }
  return text;
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-setup-secret');
  const expected = process.env.SETUP_SECRET || 'orderraft-setup-2026';

  if (secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results: string[] = [];

  // 1. Run column migrations via Management API
  if (accessToken) {
    try {
      await runSql(MIGRATION_SQL, accessToken);
      results.push('columns: ok');

      try {
        const storageSql = readFileSync(
          join(process.cwd(), 'supabase/migrations/006_storage_buckets.sql'),
          'utf8'
        );
        await runSql(storageSql, accessToken);
        results.push('storage policies: ok');
      } catch (e) {
        results.push(`storage policies: ${e instanceof Error ? e.message : 'failed'}`);
      }
    } catch (e) {
      results.push(`sql: ${e instanceof Error ? e.message : 'failed'}`);
    }
  } else {
    results.push('sql: skipped (no SUPABASE_ACCESS_TOKEN)');
  }

  // 2. Create storage buckets via Storage API
  const buckets = ['avatars', 'portfolio', 'request-images', 'completions', 'chat-attachments'];
  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: bucket === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (error && !error.message.includes('already exists')) {
      results.push(`bucket ${bucket}: ${error.message}`);
    } else {
      results.push(`bucket ${bucket}: ok`);
    }
  }

  // 3. Verify columns
  const { error: verifyError } = await supabase
    .from('maker_profiles')
    .select('is_promoted, cover_url')
    .limit(1);

  return NextResponse.json({
    ok: !verifyError,
    results,
    verify: verifyError?.message || 'columns exist',
  });
}
