"use client";

import {
  createClient,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import { useEffect, useState } from "react";

// --- Define Entry Skeleton (only need 'kategori' for this component) ---
type CategorySkeleton = EntrySkeletonType<{
  kategori: "Symbol";
  // We only fetch the 'kategori' field
}>;

// --- Contentful Client ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || "t9mzshfdsxqi";
const accessToken =
  process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN ||
  "LKz78VtKAm49yTTwYtLo2PTpGsjqkb-3-xdMN7cTUz8";

let client: ContentfulClientApi<undefined> | null = null;
if (spaceId && accessToken) {
  client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });
} else {
  console.warn(
    "Kategori Component: Contentful client could not be initialized due to missing configuration."
  );
}

// Props definition including potential callback for category selection
interface KategoriProps {
  onSelectCategory?: (category: string) => void; // Optional callback function
  selectedCategory?: string; // Optional prop to highlight the selected category
}

export const Kategori: React.FC<KategoriProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setError("Konfigurasi Contentful tidak lengkap.");
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all entries of type 'blog', but only select the 'kategori' field
        const response = await client.getEntries<CategorySkeleton>({
          content_type: "blog",
          select: ["fields.kategori"], // Optimize query to only fetch category
          limit: 1000, // Fetch a large number to likely get all categories
        });

        // Extract unique categories
        const uniqueCategories = new Set<string>();
        response.items.forEach((item) => {
          if (item.fields.kategori) {
            uniqueCategories.add(item.fields.kategori);
          }
        });

        // Set state with "Semua" first, then sorted unique categories
        setCategories(["Semua", ...Array.from(uniqueCategories).sort()]);
      } catch (err: any) {
        console.error("Error fetching categories from Contentful:", err);
        setError("Gagal memuat kategori.");
        setCategories(["Semua"]); // Provide default if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    // Add local state management for active button if needed without callback
  };

  // Basic loading and error display (can be enhanced)
  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">Memuat kategori...</div>
    );
  }
  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="mb-9 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Kategori</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((kategori) => {
            const isActive = selectedCategory === kategori;
            return (
              <button
                key={kategori}
                onClick={() => handleCategoryClick(kategori)}
                className={`
              py-1 px-4 rounded-full border text-sm transition-colors duration-200 
              ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-500"
              }
              
            `}
              >
                {kategori}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Notes ---
// 1. Filtering Logic: This component displays categories but doesn't filter posts by itself.
//    You'll need to implement filtering in the parent component that uses <Kategori />
//    by passing an `onSelectCategory` function and potentially a `selectedCategory` prop.
// 2. Fetch Limit: The `limit: 1000` assumes you have fewer than 1000 blog posts.
//    If you have more, you might need pagination to fetch all categories reliably.
// 3. Styling: Adjust Tailwind classes as needed for your desired look.
