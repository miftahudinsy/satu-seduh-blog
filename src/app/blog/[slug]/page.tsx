import {
  createClient,
  Asset,
  EntrySkeletonType,
  ContentfulClientApi,
} from "contentful";
import Image from "next/image";
import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import React from "react";

// --- Define Props Type Explicitly ---
type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type PostSkeleton = EntrySkeletonType<{
  judul: string;
  slug: string;
  excerpt: string;
  coverImage: Asset;
  content: Document;
  kategori: string;
}>;

type LinkedImageAsset = Asset<undefined, string>;

// --- Klien Contentful ---
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const client: ContentfulClientApi<undefined> = createClient({
  space: spaceId!,
  accessToken: accessToken!,
});

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

// --- Rich Text Rendering Options ---
// Customize how different elements in Rich Text are rendered
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Page Component (Server Component)
async function PostPage({ params }: Props) {
  const slug = (await params).slug;

  try {
    // Fetch the specific post by slug
    const query = {
      content_type: "blog",
      "fields.slug": slug,
      limit: 1,
      include: 2,
    } as const;

    const response = await client.getEntries<PostSkeleton>(query);

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
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        ) : (
          <div className="h-16"></div> // Add some space if no image
        )}
        <div className="prose prose-lg max-w-none prose-blue prose-img:rounded-lg prose-img:mx-auto">
          {content &&
            documentToReactComponents(content, richTextOptions(links))}
        </div>
      </article>
    );
  } catch (error) {
    console.error("Error fetching post detail:", error);
  }
}

export default PostPage;
