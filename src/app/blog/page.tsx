import {
  createClient,
  Entry,
  EntrySkeletonType,
  ContentfulClientApi,
  Asset,
} from "contentful";
import BlogList from "./BlogList";

type PostSkeleton = EntrySkeletonType<{
  judul: string;
  slug: string;
  excerpt: string;
  coverImage: Asset;
  content: Document;
  kategori: string;
}>;

// --- Klien Contentful ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId!,
  accessToken: accessToken!,
});

// Fetch Data
async function BlogPage() {
  let posts: Entry<PostSkeleton, undefined, string>[] = [];
  let categories: string[] = [];
  let error: string | null = null;

  try {
    const response = await client.getEntries<PostSkeleton>({
      content_type: "blog",
      order: ["-sys.createdAt"], // Urutkan dari terbaru
      include: 1,
      // Ambil semua field yang dibutuhkan untuk list & filtering
      select: [
        "sys.id",
        "sys.createdAt",
        "fields.judul",
        "fields.slug",
        "fields.excerpt",
        "fields.coverImage",
        "fields.kategori",
      ],
    });

    posts = response.items.filter(
      (item): item is Entry<PostSkeleton, undefined, string> => !!item
    );

    const categorySet = new Set<string>();
    posts.forEach((post) => {
      if (post.fields.kategori) {
        categorySet.add(post.fields.kategori);
      }
    });
    categories = Array.from(categorySet).sort();
  } catch (err: unknown) {
    console.error("Error fetching posts for blog page:", err);
    error = "Terjadi kesalahan saat memuat data postingan.";
    if (err instanceof Error) {
      error = `Terjadi kesalahan saat memuat data postingan: ${err.message}`;
    }
  }

  // Kirim data ke Client Component
  return (
    <BlogList
      initialPosts={posts}
      allCategories={categories}
      fetchError={error}
    />
  );
}

export default BlogPage;
