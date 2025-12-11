import { getTranslations } from "next-intl/server";
import ProfilePictureMaker from "@/components/profile-picture-maker";
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
  const t = await getTranslations({ locale, namespace: "ProfilePictureMaker.metadata" });

  return constructMetadata({
    page: "ProfilePictureMaker",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pfpmaker`,
  });
}

export default async function PFPMakerPage({ params }: { params: Params }) {
  return <ProfilePictureMaker />;
}

