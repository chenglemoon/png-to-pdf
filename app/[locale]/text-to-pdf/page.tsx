import TextToPdfComponent from "@/components/text-to-pdf";
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
  const t = await getTranslations({ locale, namespace: "TextToPdf.metadata" });

  return constructMetadata({
    page: "TextToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/text-to-pdf`,
  });
}

export default async function TextToPdfPage({ params }: { params: Params }) {
  return <TextToPdfComponent />;
}

