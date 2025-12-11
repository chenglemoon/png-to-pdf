import SvgToPdfComponent from "@/components/svg-to-pdf";
import { constructMetadata } from "@/lib/metadata";
import { Locale } from "@/i18n/routing";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SvgToPdf.metadata" });

  return constructMetadata({
    page: "SvgToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/svg-to-pdf`,
  });
}

export default async function SvgToPdfPage({ params }: { params: Params }) {
  return <SvgToPdfComponent />;
}

