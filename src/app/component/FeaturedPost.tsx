"use client";

import {
  createClient,
  Entry,
  Asset,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// --- Define Entry Skeleton based on your 'blog' Content Type ---
type PostSkeleton = EntrySkeletonType<{
  judul: "Symbol";
  slug: "Symbol";
  excerpt: "Text"; // Changed from Symbol to Text based on JSON
  coverImage: "Link"; // Link to an Asset
  content: "RichText"; // Based on JSON
  kategori: "Symbol";
  // NOTE: publishDate field is missing, will use sys.createdAt for ordering/display
  // NOTE: author field is missing, will not display author info
}>;

// Type for the linked Asset (Image)
type LinkedImageAsset = Asset<undefined, string>;

// --- Contentful Client ---
// Ensure you have NEXT_PUBLIC_CONTENTFUL_SPACE_ID and NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN in your .env.local
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  console.error(
    "Contentful Space ID or Access Token is missing. Please check environment variables."
  );
  // Optionally throw an error or return a component indicating configuration error
}

// Initialize client, handle potential missing config gracefully in component
let client: ContentfulClientApi<undefined> | null = null;
if (spaceId && accessToken) {
  client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });
} else {
  console.warn(
    "Contentful client could not be initialized due to missing configuration."
  );
}

export const FeaturedPost = () => {
  // State holds entries conforming to PostSkeleton
  const [posts, setPosts] = useState<Entry<PostSkeleton, undefined, string>[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setError("Konfigurasi Contentful tidak lengkap.");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch

        // Fetch entries including slug
        const response = await client.getEntries<PostSkeleton>({
          content_type: "blog", // Use your actual Content Type ID: 'blog'
          order: ["-sys.createdAt"], // Order by creation date descending (no publishDate field)
          limit: 3,
          include: 1, // Include linked assets (coverImage)
          select: [
            "sys.id",
            "sys.createdAt",
            "fields.judul",
            "fields.slug",
            "fields.excerpt",
            "fields.coverImage",
          ],
        });

        setPosts(
          response.items.filter(
            (item): item is Entry<PostSkeleton, undefined, string> => !!item
          )
        );
      } catch (err: any) {
        console.error("Error fetching Contentful data:", err);
        let errorMessage = "Gagal memuat postingan.";
        if (
          err?.sys?.id === "InvalidQuery" ||
          err?.message?.includes("InvalidQuery")
        ) {
          errorMessage =
            "Gagal memuat postingan: Query tidak valid. Periksa ID field (mis. 'sys.createdAt', 'fields.slug') atau ID Content Type ('blog').";
        } else if (
          err?.sys?.id === "AccessTokenInvalid" ||
          err?.message?.includes("401")
        ) {
          errorMessage =
            "Gagal memuat postingan: Masalah autentikasi. Periksa Space ID dan Access Token.";
        } else if (
          err?.sys?.id === "NotFound" ||
          err?.message?.includes("NotFound")
        ) {
          errorMessage =
            "Gagal memuat postingan: Resource tidak ditemukan (mis. ID Content Type 'blog' salah?).";
        } else if (err instanceof Error) {
          errorMessage = `Gagal memuat postingan: ${err.message}`;
        }
        setError(errorMessage);
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array ensures this runs once on mount

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Tanggal tidak tersedia";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      return date.toLocaleDateString("id-ID", options);
    } catch {
      return "Format tanggal error";
    }
  };

  // Render function for a single post card
  const renderPostCard = (post: Entry<PostSkeleton, undefined, string>) => {
    const { judul, excerpt, slug } = post.fields;
    const createdAt = post.sys.createdAt; // Use creation date

    // Cover Image Data
    const coverImageAsset = post.fields.coverImage as
      | LinkedImageAsset
      | undefined;
    const imageUrl = coverImageAsset?.fields?.file?.url;
    const imageAlt =
      coverImageAsset?.fields?.description || judul || "Gambar Kover";
    const imageWidth = coverImageAsset?.fields?.file?.details?.image?.width;
    const imageHeight = coverImageAsset?.fields?.file?.details?.image?.height;

    if (!slug) {
      console.warn(`Postingan "${judul}" tidak memiliki slug.`);
      return null;
    }

    return (
      <div
        key={post.sys.id} // Use Contentful sys.id as key
        className="bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-lg"
      >
        {/* Cover Image */}
        {imageUrl && imageWidth && imageHeight ? (
          <div className="relative h-48 w-full">
            <Image
              src={`https:${imageUrl}`} // Prepend https:
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="object-cover w-full h-full" // Ensure image covers area
              priority={posts.indexOf(post) < 3} // Prioritize loading for first few images
            />
          </div>
        ) : (
          // Optional: Placeholder if no image
          <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Tanpa Gambar</span>
          </div>
        )}

        {/* Post Content */}
        <div className="p-6 flex flex-col flex-grow">
          <p className="text-sm text-gray-500 mb-2">
            {formatDate(createdAt)} {/* Display creation date */}
          </p>
          <Link href={`/blog/${slug}`} className="group">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2">
              {judul || "Tanpa Judul"}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-4">
            {excerpt || "Tidak ada deskripsi"}
          </p>
          {/* Removed Author section as it's not in the Content Type */}
          {/* <div className="mt-auto pt-4 border-t border-gray-200"> */}
          {/* Placeholder or remove if no footer content needed */}
          {/* <span className="text-xs text-gray-400">Artikel Terbaru</span> */}
          {/* </div> */}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white mb-9 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Postingan Terbaru
        </h2>

        {loading && (
          <p className="text-center text-gray-500 py-8">Memuat postingan...</p>
        )}

        {error && (
          <p className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-300">
            {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-gray-500 py-8">Belum ada postingan.</p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(renderPostCard).filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  );
};
