import type { FC } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

interface JsonLdProps {
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FaqItem[];
  toolName?: string;
  toolDescription?: string;
  url?: string;
}

export const JsonLd: FC<JsonLdProps> = ({
  breadcrumbs,
  faqs,
  toolName,
  toolDescription,
  url = "https://pdfella.tharidulakmal.com",
}) => {
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: toolName ? `${toolName} — PDFella` : "PDFella",
      url,
      description:
        toolDescription ||
        "Free, fast, and 100% private client-side PDF utility suite. All PDF processing happens strictly inside your browser with zero server uploads.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All (Web Browser)",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      image: "https://pdfella.tharidulakmal.com/og-image.jpg",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        name: "Tharidu Lakmal",
        url: "https://tharidulakmal.com",
      },
      creator: {
        "@type": "Person",
        name: "Tharidu Lakmal",
        url: "https://tharidulakmal.com",
      },
      featureList: [
        "100% Client-Side Processing",
        "Zero Server Uploads",
        "Merge Multiple PDFs",
        "Split PDF & Extract Pages",
        "Remove Unwanted Pages",
        "Organize & Rotate Pages",
        "Compress PDF File Size",
        "Offline Capable",
      ],
    },
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: b.name,
        item: b.item.startsWith("http")
          ? b.item
          : `https://pdfella.tharidulakmal.com${b.item}`,
      })),
    });
  }

  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
