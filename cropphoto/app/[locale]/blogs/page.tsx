import { listPublishedPostsAction } from "@/actions/blogs/posts";
import { listTagsAction, Tag } from "@/actions/blogs/tags";
import { getPosts } from "@/lib/getBlogs";
import { constructMetadata } from "@/lib/metadata";
import { TextSearch } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogList } from "./BlogList";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blogs" });

  return constructMetadata({
    page: "Blogs",
    title: t("title"),
    description: t("description"),
    locale: locale as "en" | "zh" | "ja" | "de" | "es",
    path: `/blogs`,
  });
}

const SERVER_POST_PAGE_SIZE = 48;

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations("Blogs");

  const { posts: localPosts } = await getPosts(locale as "en" | "zh" | "ja" | "de" | "es");

  const initialServerPostsResult = await listPublishedPostsAction({
    pageIndex: 0,
    pageSize: SERVER_POST_PAGE_SIZE,
    locale: locale,
  });

  const initialServerPosts =
    initialServerPostsResult.success && (initialServerPostsResult.data as any)?.posts
      ? (initialServerPostsResult.data as any).posts
      : [];
  const totalServerPosts =
    initialServerPostsResult.success && (initialServerPostsResult.data as any)?.count
      ? (initialServerPostsResult.data as any).count
      : 0;

  if (!initialServerPostsResult.success) {
    console.error(
      "Failed to fetch initial server posts:",
      (initialServerPostsResult as any).error
    );
  }

  const tagsResult = await listTagsAction(locale as "en" | "zh" | "ja" | "de" | "es");
  let serverTags: Tag[] = [];
  if (tagsResult.success && (tagsResult.data as any)?.tags) {
    serverTags = (tagsResult.data as any).tags;
  }

  const noPostsFound =
    localPosts.length === 0 && initialServerPosts.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{t("title")}</h1>

      {noPostsFound ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <TextSearch className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {t("emptyState.title") || "No blog posts"}
          </h2>
          <p className="text-gray-500 max-w-md">
            {t("emptyState.description") ||
              "We are creating exciting content, please stay tuned!"}
          </p>
        </div>
      ) : (
        <BlogList
          localPosts={localPosts}
          initialPosts={initialServerPosts}
          initialTotal={totalServerPosts}
          serverTags={serverTags}
          locale={locale}
          pageSize={SERVER_POST_PAGE_SIZE}
        />
      )}
    </div>
  );
}
