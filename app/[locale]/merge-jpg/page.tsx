import JpgToPdfComponent from "@/components/jpg-to-pdf";
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
  const t = await getTranslations({ locale, namespace: "JpgToPdf.metadata" });

  return constructMetadata({
    page: "JpgToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/merge-jpg`,
  });
}

export default async function MergeJpgPage({ params }: { params: Params }) {
  return <JpgToPdfComponent />;
}

