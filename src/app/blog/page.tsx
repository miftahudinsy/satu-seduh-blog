import {
  createClient,
  Entry,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import BlogList from "./BlogList"; // Kita akan buat komponen ini nanti

// --- Define Entry Skeleton (sama seperti di [slug]/page.tsx) ---
// (Pastikan ini konsisten atau impor dari file shared type jika ada)
type PostSkeleton = EntrySkeletonType<{
  judul: "Symbol";
  slug: "Symbol";
  excerpt: "Text";
  coverImage: "Link"; // Link to an Asset
  content: "RichText"; // Meskipun tidak ditampilkan di list, perlu ada di skeleton
  kategori: "Symbol";
}>;

// Type for the linked Asset (Image)

// --- Contentful Client Initialization ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error(
    "Contentful Space ID and Access Token must be provided in environment variables for blog page."
  );
}

// Inisialisasi client hanya sekali
const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId,
  accessToken: accessToken,
});

// --- Server Component to Fetch Data ---
async function BlogPage() {
  let posts: Entry<PostSkeleton, undefined, string>[] = [];
  let categories: string[] = [];
  let error: string | null = null;

  try {
    const response = await client.getEntries<PostSkeleton>({
      content_type: "blog",
      order: ["-sys.createdAt"], // Urutkan dari terbaru
      include: 1, // Include linked assets (coverImage)
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

    // Extract unique categories
    const categorySet = new Set<string>();
    posts.forEach((post) => {
      if (post.fields.kategori) {
        categorySet.add(post.fields.kategori);
      }
    });
    categories = Array.from(categorySet).sort(); // Urutkan kategori
  } catch (err: unknown) {
    console.error("Error fetching posts for blog page:", err);
    // Berikan pesan error yang lebih spesifik jika memungkinkan
    if (
      err &&
      typeof err === "object" &&
      "sys" in err &&
      typeof (err as any).sys === "object" &&
      (err as any).sys?.id === "AccessTokenInvalid"
    ) {
      error = "Error Autentikasi Contentful. Periksa Access Token.";
    } else if (
      err instanceof Error &&
      err.message?.includes("connect ECONNREFUSED")
    ) {
      error =
        "Tidak dapat terhubung ke Contentful. Periksa koneksi internet atau status Contentful.";
    } else {
      error = "Terjadi kesalahan saat memuat data postingan.";
    }
    // Kita akan tampilkan error di Client Component
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
