import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 明确排除不需要处理的路径，让它们直接通过
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|xml)$/i)
  ) {
    // 对于静态资源和 API，不经过 middleware，让 Next.js 直接处理
    return NextResponse.next();
  }

  // next-intl middleware 目前仍需要 NextRequest 类型
  // NextRequest 是 Request 的扩展，所以可以安全转换
  return intlMiddleware(request as NextRequest);
}

// 使用 next-intl 推荐的 matcher 配置
// 匹配所有路径，但在 middleware 内部进行过滤
export const config = {
  matcher: [
    // 匹配所有路径，middleware 内部会过滤
    '/(.*)',
    '/'
  ]
};

