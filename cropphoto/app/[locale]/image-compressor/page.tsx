import { getTranslations } from "next-intl/server";
import ImageCompressor from "@/components/image-compressor";
import { constructMetadata } from "@/lib/metadata";
import { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ImageCompressor.metadata" });

  return constructMetadata({
    page: "ImageCompressor",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/image-compressor`,
  });
}

export default async function ImageCompressorPage({ params }: { params: Params }) {
  return <ImageCompressor />;
}


