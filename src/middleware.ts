import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

async function getPayloadSecret(): Promise<Uint8Array> {
  const raw = process.env.PAYLOAD_SECRET ?? ''
  const encoded = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const secret = hashHex.slice(0, 32)
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')?.value

  if (!token) {
    return NextResponse.next()
  }

  try {
    const secret = await getPayloadSecret()
    const { payload } = await jwtVerify(token, secret)

    if (payload.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
