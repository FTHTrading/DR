/**
 * DICS Alert Worker — Cloudflare Worker
 *
 * Receives webhook POSTs from the extractor when a high-scoring claim is found,
 * validates the payload, and fans out to configured notification channels.
 *
 * Deploy with: wrangler deploy
 */

export interface Env {
  WEBHOOK_SECRET: string;   // shared secret for HMAC verification
  SLACK_WEBHOOK_URL: string;
  ALERT_THRESHOLD: string;  // composite score minimum (e.g. "0.65")
}

interface AlertPayload {
  claim_id: string;
  doc_id: string;
  source_url: string;
  statement: string;
  composite_score: number;
  credibility: number;
  materiality: number;
  opportunity: number;
  usd_amount: number | null;
  tags: string[];
}

// Verify HMAC-SHA256 signature sent as X-DICS-Signature header
async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = hexToBytes(signature.replace('sha256=', ''));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function postToSlack(webhookUrl: string, payload: AlertPayload): Promise<void> {
  const usd = payload.usd_amount
    ? `  *USD:* $${(payload.usd_amount / 1_000_000).toFixed(1)}M`
    : '';

  const body = {
    text: `🔍 *DICS Alert* — Score ${payload.composite_score.toFixed(2)}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `*DICS Signal* — composite \`${payload.composite_score.toFixed(2)}\``,
            `> ${payload.statement.slice(0, 280)}`,
            `*Source:* ${payload.source_url}${usd}`,
            `*Credibility:* ${payload.credibility.toFixed(2)}  *Materiality:* ${payload.materiality.toFixed(2)}  *Opportunity:* ${payload.opportunity.toFixed(2)}`,
            `*Tags:* ${payload.tags.join(', ')}`,
          ].join('\n'),
        },
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('X-DICS-Signature') ?? '';

    const valid = await verifySignature(rawBody, signature, env.WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Unauthorized', { status: 401 });
    }

    let payload: AlertPayload;
    try {
      payload = JSON.parse(rawBody) as AlertPayload;
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    const threshold = parseFloat(env.ALERT_THRESHOLD || '0.65');
    if (payload.composite_score < threshold) {
      return new Response('Below threshold', { status: 200 });
    }

    await postToSlack(env.SLACK_WEBHOOK_URL, payload);

    return new Response(JSON.stringify({ status: 'delivered' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
