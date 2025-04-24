"use client";

import {
  createClient,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import { useEffect, useState } from "react";

type CategorySkeleton = EntrySkeletonType<{
  kategori: "Symbol";
}>;

// --- Klien Contentful ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId!,
  accessToken: accessToken!,
});

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

  useEffect(() => {
    if (!client) {
      return;
    }

    const fetchCategories = async () => {
      try {
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
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);
        setCategories([]); // Kosongkan kategori jika error
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

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
