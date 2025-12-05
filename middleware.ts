import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverConfig } from './src/config/server.config';

// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of Array.from(rateLimitMap.entries())) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, serverConfig.rateLimit.cleanupIntervalMinutes * 60 * 1000);

export function middleware(request: NextRequest) {
  // Only apply to child endpoints
  if (request.nextUrl.pathname.startsWith('/child/')) {
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Apply rate limiting from config
    if (!rateLimit(ip, serverConfig.rateLimit.requestsPerWindow, serverConfig.rateLimit.windowMinutes * 60 * 1000)) {
      return NextResponse.json(
        { error: 'יותר מדי בקשות. נסה שוב מאוחר יותר.' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/child/:path*',
};

