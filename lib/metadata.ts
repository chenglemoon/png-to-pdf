import { siteConfig } from '@/config/site'
import { DEFAULT_LOCALE, LOCALE_NAMES, Locale } from '@/i18n/routing'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type MetadataProps = {
  page?: string
  title?: string
  description?: string
  keywords?: string
  images?: string[]
  noIndex?: boolean
  locale: Locale
  path?: string
  canonicalUrl?: string
}

export async function constructMetadata({
  page = 'Home',
  title,
  description,
  keywords,
  images = [],
  noIndex = false,
  locale,
  path,
  canonicalUrl,
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Home' })

  const pageTitle = title || t(`title`)
  const pageDescription = description || t(`description`)

  const finalTitle = page === 'Home'
    ? `${pageTitle} - ${t('tagLine')}`
    : `${pageTitle} | ${t('title')}`

  canonicalUrl = canonicalUrl || path
  
  // 判断是否为首页（空字符串、'/' 或 undefined）
  const isHomePage = !canonicalUrl || canonicalUrl === '' || canonicalUrl === '/'

  // 生成正确的hreflang标签，确保多语言SEO正确配置
  const alternateLanguages = Object.keys(LOCALE_NAMES).reduce((acc, lang) => {
    let path: string
    if (isHomePage) {
      // 首页：默认语言无路径，其他语言只有语言代码
      path = lang === DEFAULT_LOCALE ? '' : `/${lang}`
    } else {
      // 其他页面：添加尾部斜杠
      const normalizedPath = canonicalUrl!.endsWith('/') ? canonicalUrl! : `${canonicalUrl}/`
      path = `${lang === DEFAULT_LOCALE ? '' : `/${lang}`}${normalizedPath}`
    }
    acc[lang] = `${siteConfig.url}${path}`
    return acc
  }, {} as Record<string, string>)

  // 添加x-default标签，指向英文版本作为默认语言
  if (isHomePage) {
    alternateLanguages['x-default'] = `${siteConfig.url}`
  } else {
    const normalizedPath = canonicalUrl!.endsWith('/') ? canonicalUrl! : `${canonicalUrl}/`
    alternateLanguages['x-default'] = `${siteConfig.url}${normalizedPath}`
  }

  // Open Graph
  const imageUrls = images.length > 0
    ? images.map(img => ({
      url: img.startsWith('http') ? img : `${siteConfig.url}/${img}`,
      alt: pageTitle,
    }))
    : [{
      url: `${siteConfig.url}/og${locale === DEFAULT_LOCALE ? '' : '_' + locale}.png`,
      alt: pageTitle,
    }]
  // 生成 pageURL，首页不加尾部斜杠
  const pageURL = isHomePage
    ? `${locale === DEFAULT_LOCALE ? '' : `/${locale}`}`
    : `${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${path}`

  return {
    title: finalTitle,
    description: pageDescription,
    keywords: keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      // 保持每个语言版本指向自己的URL，这是多语言SEO的正确做法
      canonical: isHomePage 
        ? `${siteConfig.url}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}`
        : `${siteConfig.url}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${canonicalUrl!.endsWith('/') ? canonicalUrl! : `${canonicalUrl}/`}`,
      // 优化hreflang标签，包含x-default指向英文版本
      languages: alternateLanguages,
    },
    // Create an OG image using https://ogimage.click
    openGraph: {
      type: 'website',
      title: finalTitle,
      description: pageDescription,
      url: pageURL,
      siteName: t('title'),
      locale: locale,
      images: imageUrls,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: pageDescription,
      site: `${siteConfig.url}${pageURL === '/' ? '' : pageURL}`,
      images: imageUrls,
      creator: siteConfig.creator,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  }
}