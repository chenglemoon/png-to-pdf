import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const common = (await import(`./messages/${locale}/common.json`)).default;

  return {
    locale,
    messages: {
      // common (先展开)
      ...common,
      
      // PNG to PDF
      PngToPdf: (await import(`./messages/${locale}/PngToPdf.json`)).default,
      
      // JPG to PDF
      JpgToPdf: (await import(`./messages/${locale}/JpgToPdf.json`)).default,
      
      // Image to PDF
      ImageToPdf: (await import(`./messages/${locale}/ImageToPdf.json`)).default,
      
      // WebP to PDF
      WebpToPdf: (await import(`./messages/${locale}/WebpToPdf.json`)).default,
      
      // SVG to PDF
      SvgToPdf: (await import(`./messages/${locale}/SvgToPdf.json`)).default,
      
      // BMP to PDF
      BmpToPdf: (await import(`./messages/${locale}/BmpToPdf.json`)).default,
      
      // HEIC to PDF
      HeicToPdf: (await import(`./messages/${locale}/HeicToPdf.json`)).default,
      
      // TIFF to PDF
      TiffToPdf: (await import(`./messages/${locale}/TiffToPdf.json`)).default,
      
      // Text to PDF
      TextToPdf: (await import(`./messages/${locale}/TextToPdf.json`)).default,
      
      // PDF to JPG
      PdfToJpg: (await import(`./messages/${locale}/PdfToJpg.json`)).default,
      
      // PDF to PNG
      PdfToPng: (await import(`./messages/${locale}/PdfToPng.json`)).default,
      
      // PDF to WebP
      PdfToWebp: (await import(`./messages/${locale}/PdfToWebp.json`)).default,
      
      // PDF to BMP
      PdfToBmp: (await import(`./messages/${locale}/PdfToBmp.json`)).default,
      
      // PDF to TIFF
      PdfToTiff: (await import(`./messages/${locale}/PdfToTiff.json`)).default,
      
      // Testimonials
      Testimonials: (await import(`./messages/${locale}/Testimonials.json`)).default,
      
      // Terms of Service
      TermsOfService: (await import(`./messages/${locale}/TermsOfService.json`)).default,
      
      // Privacy Policy
      PrivacyPolicy: (await import(`./messages/${locale}/PrivacyPolicy.json`)).default
    }
  };
});