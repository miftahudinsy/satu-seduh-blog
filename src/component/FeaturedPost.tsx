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

// --- Definisikan Skeleton Entri ---
type PostSkeleton = EntrySkeletonType<{
  judul: string;
  slug: string;
  excerpt: string;
  coverImage: Asset;
}>;

// Tipe untuk Asset (Gambar) yang tertaut
type LinkedImageAsset = Asset<undefined, string>;

// --- Klien Contentful ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId!,
  accessToken: accessToken!,
});

export const FeaturedPost = () => {
  // State menyimpan entri yang sesuai dengan PostSkeleton
  const [posts, setPosts] = useState<Entry<PostSkeleton, undefined, string>[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error pada fetch baru

        // Fetch entri termasuk slug
        const response = await client.getEntries<PostSkeleton>({
          content_type: "blog",
          order: ["-sys.createdAt"], // Urutkan berdasarkan tanggal pembuatan descending
          limit: 3,
          include: 1,
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
      } catch (err: unknown) {
        console.error("Error fetching featured posts:", err);
        const errorMessage = "Gagal memuat postingan terbaru.";

        setError(errorMessage);
        setPosts([]); // Kosongkan post jika ada error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  // Fungsi render untuk satu kartu post
  const renderPostCard = (post: Entry<PostSkeleton, undefined, string>) => {
    const { judul, excerpt, slug } = post.fields;
    const createdAt = post.sys.createdAt;

    // Data Gambar Kover
    const coverImageAsset = post.fields.coverImage as
      | LinkedImageAsset
      | undefined;
    const imageUrl = coverImageAsset?.fields?.file?.url;
    const imageAlt =
      coverImageAsset?.fields?.description || judul || "Gambar Kover";
    const imageWidth = coverImageAsset?.fields?.file?.details?.image?.width;
    const imageHeight = coverImageAsset?.fields?.file?.details?.image?.height;

    return (
      <div
        key={post.sys.id}
        className="bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-lg"
      >
        {/* Gambar Kover */}
        {imageUrl && imageWidth && imageHeight && (
          <Link href={`/blog/${slug}`} className="block relative h-48 w-full">
            <Image
              src={`https:${imageUrl}`}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="object-cover w-full h-full"
            />
          </Link>
        )}

        {/* Konten Post */}
        <div className="p-6 flex flex-col flex-grow">
          <p className="text-sm text-gray-500 mb-2">
            {formatDate(createdAt)} {/* Tampilkan tanggal pembuatan */}
          </p>
          <Link href={`/blog/${slug}`} className="group">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2">
              {judul}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-4">
            {excerpt}
          </p>
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
