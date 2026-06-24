import { NextRequest, NextResponse } from 'next/server';

const NGINX_URL = process.env.NGINX_URL || 'http://localhost:80';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${NGINX_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // Re-pose les cookies avec le domaine de la requête entrante (IP ou hostname)
  const host = req.headers.get('host')?.split(':')[0] ?? 'localhost';

  const upstreamCookies = upstream.headers.getSetCookie?.() ?? [];
  const res = NextResponse.json(data, { status: 200 });

  for (const raw of upstreamCookies) {
    const [nameVal, ...parts] = raw.split(';').map(s => s.trim());
    const [name, value] = nameVal.split('=');
    const attrs: Record<string, string | boolean> = {};
    for (const part of parts) {
      const [k, v] = part.split('=');
      attrs[k.trim().toLowerCase()] = v?.trim() ?? true;
    }
    res.cookies.set(name, value, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      domain: host,
      maxAge: typeof attrs['max-age'] === 'string' ? parseInt(attrs['max-age']) : undefined,
    });
  }

  return res;
}
