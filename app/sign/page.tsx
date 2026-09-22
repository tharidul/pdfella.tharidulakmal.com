import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { SignPdfView, SIGN_PDF_FAQS } from "@/components/features/pdf";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Fill & eSign PDF Documents",
  description:
    "Sign PDF documents online for free. Draw, type, or upload electronic signatures, add date stamps, and create transparent PNGs. 100% private in your browser.",
  alternates: {
    canonical: "/sign",
  },
  openGraph: {
    title: "Sign PDF Online Free - Fill & eSign PDF Documents",
    description:
      "Sign PDF documents online for free. Draw, type, or upload electronic signatures, add date stamps, and create transparent PNGs. 100% private in your browser.",
    url: "https://pdfx.tharidulakmal.com/sign",
  },
};

export default function SignPage() {
  return (
    <AppLayout>
      <SignPdfView />
      <JsonLd
        toolName="Sign PDF"
        toolDescription="Draw, type, or upload electronic signatures and stamp them onto PDF contracts and forms securely in your browser."
        url="https://pdfx.tharidulakmal.com/sign"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Sign PDF", item: "/sign" },
        ]}
        faqs={SIGN_PDF_FAQS}
      />
    </AppLayout>
  );
}
