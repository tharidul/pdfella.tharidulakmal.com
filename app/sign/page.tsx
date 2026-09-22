import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { SignPdfView } from "@/components/features/pdf";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Fill & e-Signature Tool",
  description:
    "Electronically sign PDF documents online for free. Draw, type, or upload your signature, add date stamps, and position them interactively. 100% private client-side processing with zero server uploads.",
  alternates: {
    canonical: "/sign",
  },
  openGraph: {
    title: "Sign PDF Online Free - Fill & e-Signature Tool",
    description:
      "Electronically sign PDF documents online for free. Draw, type, or upload your signature, add date stamps, and position them interactively. 100% private client-side processing with zero server uploads.",
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
      />
    </AppLayout>
  );
}
