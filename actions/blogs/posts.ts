import { Locale } from "@/i18n/routing";
import { actionResponse } from "@/lib/action-response";

export interface PublicPost {
  id: string;
  title: string;
  description?: string;
  featured_image_url?: string;
  slug: string;
  tags?: string;
  published_at?: string;
  status?: "published" | "draft" | "archived";
  is_pinned?: boolean;
  content?: string;
  visibility?: string;
}

interface ListPublishedPostsParams {
  pageIndex: number;
  pageSize: number;
  locale: Locale;
  tagId?: string | null;
}

interface ListPublishedPostsResult {
  posts: PublicPost[];
  count: number;
  pageIndex: number;
  pageSize: number;
}

// 静态博客文章数据，不再依赖数据库
const STATIC_POSTS: PublicPost[] = [
  // 所有 screen-tools-guide 相关的文章已被移除
];

export async function listPublishedPostsAction({
  pageIndex,
  pageSize,
  locale,
  tagId
}: ListPublishedPostsParams) {
  try {
    let posts = STATIC_POSTS.filter(post => post.status === "published");

    // 根据语言过滤文章
    if (locale) {
      posts = posts.filter(post => {
        // 根据slug后缀或标题语言来过滤
        if (locale === "en" && !post.slug.includes("-")) return true; // 英文默认
        if (locale === "ja" && post.slug.includes("-ja")) return true;
        if (locale === "de" && post.slug.includes("-de")) return true;
        if (locale === "es" && post.slug.includes("-es")) return true;
        if (locale === "zh" && post.slug.includes("-zh")) return true;
        return false;
      });
    }

    // 计算分页
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    return actionResponse.success<ListPublishedPostsResult>({
      posts: paginatedPosts,
      count: posts.length,
      pageIndex,
      pageSize
    });
  } catch (error) {
    console.error("Failed to get posts:", error);
    return actionResponse.error("Failed to get posts");
  }
}

export async function getPublishedPosts(locale: Locale) {
  try {
    let posts = STATIC_POSTS.filter(post => post.status === "published");

    // 根据语言过滤文章
    if (locale) {
      posts = posts.filter(post => {
        if (locale === "en" && !post.slug.includes("-")) return true;
        if (locale === "ja" && post.slug.includes("-ja")) return true;
        if (locale === "de" && post.slug.includes("-de")) return true;
        if (locale === "es" && post.slug.includes("-es")) return true;
        if (locale === "zh" && post.slug.includes("-zh")) return true;
        return false;
      });
    }

    return actionResponse.success(posts);
  } catch (error) {
    console.error("Failed to get posts:", error);
    return actionResponse.error("Failed to get posts");
  }
}

export async function getPostBySlug(slug: string, locale: Locale) {
  try {
    let post = STATIC_POSTS.find(p => p.slug === slug);

    // 如果没有找到精确匹配，尝试根据语言查找
    if (!post && locale) {
      const languageSuffix = locale === "en" ? "" : `-${locale}`;
      const expectedSlug = `screen-tools-guide${languageSuffix}`;
      post = STATIC_POSTS.find(p => p.slug === expectedSlug);
    }

    if (!post) {
      return actionResponse.error("Post not found");
    }
    return actionResponse.success(post);
  } catch (error) {
    console.error("Failed to get post:", error);
    return actionResponse.error("Failed to get post");
  }
}

export async function getPosts() {
  return actionResponse.success(STATIC_POSTS);
}

export async function getPost(id: string) {
  const post = STATIC_POSTS.find(p => p.id === id);
  if (!post) {
    return actionResponse.error("Post not found");
  }
  return actionResponse.success(post);
}

export async function createPost() {
  return actionResponse.error("Post creation not available");
}

export async function updatePost() {
  return actionResponse.error("Post update not available");
}

export async function deletePost() {
  return actionResponse.error("Post deletion not available");
}

// 添加缺失的导出函数以匹配预期的API
export const getPublishedPostBySlugAction = getPostBySlug; 