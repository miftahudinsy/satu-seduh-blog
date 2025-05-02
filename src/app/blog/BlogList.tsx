"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Entry, Asset, EntrySkeletonType } from "contentful";

type PostSkeleton = EntrySkeletonType<{
  judul: string;
  slug: string;
  excerpt: string;
  coverImage: Asset;
  content: Document;
  kategori: string;
}>;
type LinkedImageAsset = Asset<undefined, string>;
type PostEntry = Entry<PostSkeleton, undefined, string>;

interface BlogListProps {
  initialPosts: PostEntry[];
  allCategories: string[];
  fetchError: string | null;
}

const ITEMS_PER_PAGE = 3;

// fungsi buat format tanggal
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Tanggal tidak tersedia";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Tanggal tidak valid";
    return date.toLocaleDateString("id-ID", options);
  } catch {
    return "Format tanggal error";
  }
};

// --- Helper function for safe string matching (Moved outside component) ---
const safeLowerCaseIncludes = (
  field: string | undefined | null,
  query: string
): boolean => {
  if (typeof field === "string") {
    return field.toLowerCase().includes(query);
  }
  return false;
};

// --- Client Component for Blog List ---
const BlogList: React.FC<BlogListProps> = ({
  initialPosts,
  allCategories,
  fetchError,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState<PostEntry[]>(initialPosts);

  // Filter posts whenever initialPosts, searchQuery, or selectedCategory changes
  useEffect(() => {
    let posts = initialPosts;

    // Filter by category
    if (selectedCategory) {
      posts = posts.filter((post) => post.fields.kategori === selectedCategory);
    }

    // Filter by search query (judul or excerpt) using helper
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      posts = posts.filter((post) => {
        return (
          safeLowerCaseIncludes(post.fields.judul, lowerCaseQuery) ||
          safeLowerCaseIncludes(post.fields.excerpt, lowerCaseQuery)
        );
      });
    }

    setFilteredPosts(posts);
    setCurrentPage(1); // Reset to first page on filter change
  }, [initialPosts, searchQuery, selectedCategory]); // Removed safeLowerCaseIncludes from dependencies

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage]);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- Render Post Card  ---
  const renderPostCard = (post: PostEntry) => {
    const { judul, excerpt, slug, kategori } = post.fields;
    const createdAt = post.sys.createdAt;
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
        {imageUrl && imageWidth && imageHeight && (
          <Link href={`/blog/${slug}`} className="block relative h-48 w-full">
            <Image
              src={`https:${imageUrl}`}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="object-cover w-full h-full"
              priority={paginatedPosts.indexOf(post) < ITEMS_PER_PAGE} // Prioritize visible images
            />
          </Link>
        )}

        <div className="p-5 flex flex-col flex-grow">
          <Link href={`/blog/${slug}`} className="group">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {judul}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-4">
            {excerpt}
          </p>
          <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
            {kategori && (
              <span className="inline-block  bg-blue-100 text-blue-700 text-xs  px-2 py-0.5 rounded-full">
                {kategori}
              </span>
            )}
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white mb-9 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-28 ">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Semua Postingan
        </h1>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${
              selectedCategory === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Semua
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Cari postingan..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!fetchError && filteredPosts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {paginatedPosts.map(renderPostCard).filter(Boolean)}
          </div>
        )}

        {/* Pagination */}
        {!fetchError && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-10">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &laquo; Sebelumnya
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
