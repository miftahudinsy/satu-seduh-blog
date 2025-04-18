import {
  createClient,
  Asset,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import Image from "next/image";
import { notFound } from "next/navigation"; // Import notFound
import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import React from "react";

// --- Define Props Type Explicitly ---
type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

// --- Define Entry Skeleton (including all fields needed for detail page) ---
type PostSkeleton = EntrySkeletonType<{
  judul: "Symbol";
  slug: "Symbol";
  excerpt: "Text";
  coverImage: "Link"; // Link to an Asset
  content: "RichText"; // Crucial for detail page
  kategori: "Symbol";
}>;

// Type for the linked Asset (Image)
type LinkedImageAsset = Asset<undefined, string>;

// --- Contentful Client Initialization (Consider moving to a shared utility file) ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error(
    "Contentful Space ID and Access Token must be provided in environment variables for blog detail page."
  );
}

const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId,
  accessToken: accessToken,
});

// --- Helper Function to Format Date ---
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

// --- Rich Text Rendering Options ---
// Customize how different elements in Rich Text are rendered
const richTextOptions = (links: Record<string, any> | undefined): Options => ({
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text) => (
      <code className="bg-gray-200 text-sm p-1 rounded font-mono">{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-4xl font-bold my-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-semibold my-3">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-semibold my-3">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className="text-xl font-semibold my-2">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node, children) => (
      <h5 className="text-lg font-semibold my-2">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node, children) => (
      <h6 className="text-base font-semibold my-2">{children}</h6>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => {
      if (
        node.content.length === 1 &&
        node.content[0].nodeType === "text" &&
        node.content[0].value === ""
      ) {
        return null;
      }
      return <p className="mb-4 leading-relaxed">{children}</p>;
    },
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-4 pl-4">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-inside mb-4 pl-4">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-1">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-6 border-gray-300" />,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = links?.assets?.block?.find(
        (item: Asset) => item.sys.id === node.data.target.sys.id
      );

      if (!asset || !asset.fields?.file?.url) {
        return null;
      }
      const mimeType = asset.fields.file.contentType;
      const url = `https:${asset.fields.file.url}`;
      const alt =
        typeof asset.fields.description === "string"
          ? asset.fields.description
          : typeof asset.fields.title === "string"
          ? asset.fields.title
          : "Embedded Asset";
      const width = asset.fields.file.details?.image?.width;
      const height = asset.fields.file.details?.image?.height;

      if (mimeType?.startsWith("image/")) {
        return (
          <div className="my-6">
            <Image
              src={url}
              alt={alt}
              width={width || 800}
              height={height || 600}
              className="rounded-lg mx-auto"
            />
            {typeof asset.fields.description === "string" &&
              asset.fields.description && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  {asset.fields.description}
                </p>
              )}
          </div>
        );
      }
      return null;
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },
});

// --- Page Component (Server Component) ---
async function PostPage({ params }: Props) {
  const slug = (await params).slug;

  if (!client) {
    return (
      <div className="text-center py-20 text-red-600">
        Konfigurasi Contentful tidak lengkap. Periksa environment variables.
      </div>
    );
  }

  try {
    // Fetch the specific post by slug
    const query = {
      content_type: "blog",
      "fields.slug": slug,
      limit: 1,
      include: 2,
    } as const;

    const response = await client.getEntries<PostSkeleton>(query);

    if (!response.items || response.items.length === 0) {
      // If no post found for the slug, trigger a 404 page
      notFound();
    }

    const post = response.items[0];
    const { judul, content, kategori } = post.fields;
    const createdAt = post.sys.createdAt;

    // Cover Image Data
    const coverImageAsset = post.fields.coverImage as
      | LinkedImageAsset
      | undefined;
    const imageUrl = coverImageAsset?.fields?.file?.url;
    const imageAlt =
      typeof coverImageAsset?.fields?.description === "string"
        ? coverImageAsset.fields.description
        : judul || "Gambar Kover";
    const imageWidth = coverImageAsset?.fields?.file?.details?.image?.width;
    const imageHeight = coverImageAsset?.fields?.file?.details?.image?.height;

    // Extract links from the response to pass to the renderer
    const links = response.includes;

    return (
      <article className="max-w-3xl mx-auto px-4 py-8 pt-28 sm:px-6 lg:px-8">
        {kategori && (
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold mb-4 px-2.5 py-0.5 rounded">
            {kategori}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {judul || "Tanpa Judul"}
        </h1>
        <p className="text-base text-gray-500 mb-6">
          Dipublikasikan pada {formatDate(createdAt)}
        </p>
        {imageUrl && imageWidth && imageHeight ? (
          <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={`https:${imageUrl}`}
              alt={imageAlt}
              fill // Use fill to cover the container
              style={{ objectFit: "cover" }} // Ensure image covers
              priority // Prioritize loading the main image
            />
          </div>
        ) : (
          <div className="h-16"></div> // Add some space if no image
        )}
        <div className="prose prose-lg max-w-none prose-blue prose-img:rounded-lg prose-img:mx-auto">
          {content ? (
            documentToReactComponents(content, richTextOptions(links))
          ) : (
            <p>Konten tidak tersedia.</p>
          )}
        </div>
      </article>
    );
  } catch (error) {
    console.error("Error fetching post detail:", error);
    // You might want to render a specific error component here
    return (
      <div className="text-center py-20 text-red-600">
        Terjadi kesalahan saat memuat postingan. Coba lagi nanti.
      </div>
    );
  }
}

export default PostPage;

// --- Note on Static Generation (Optional but Recommended) ---
// For better performance, consider using generateStaticParams
// to pre-render blog pages at build time.
// See: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
// Example:
// export async function generateStaticParams() {
//   const response = await client.getEntries<PostSkeleton>({ content_type: 'blog', select: ['fields.slug'] });
//   return response.items.map((item) => ({
//     slug: item.fields.slug,
//   }));
// }
