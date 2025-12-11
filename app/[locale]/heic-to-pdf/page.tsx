import HeicToPdfComponent from "@/components/heic-to-pdf";
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
  const t = await getTranslations({ locale, namespace: "HeicToPdf.metadata" });

  return constructMetadata({
    page: "HeicToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/heic-to-pdf`,
  });
}

export default async function HeicToPdfPage({ params }: { params: Params }) {
  return <HeicToPdfComponent />;
}

