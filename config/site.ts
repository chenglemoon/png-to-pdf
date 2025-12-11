import { SiteConfig } from "@/types/siteConfig";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://png-to-pdf.online";

const TWITTER_EN = 'https://x.com/flipimageapp'
const TWITTER_ZH = 'https://x.com/flipimageapp'
const BSKY_URL = 'https://bsky.app/profile/flipimage.bsky.social'
const EMAIL_URL = 'mailto:hi@png-to-pdf.online'

export const siteConfig: SiteConfig = {
  name: 'PNG to PDF',
  url: BASE_URL,
  authors: [
    {
      name: "png-to-pdf.online",
      url: "https://png-to-pdf.online",
    }
  ],
  creator: '@flipimageapp',
  socialLinks: {
    bluesky: BSKY_URL,
    twitter: TWITTER_EN,
    twitterZh: TWITTER_ZH,
    email: EMAIL_URL,
  },
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  defaultNextTheme: 'light', // next-theme option: system | dark | light
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png", // apple-touch-icon.png
  },
}
