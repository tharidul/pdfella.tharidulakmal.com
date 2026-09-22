import { ImageResponse } from "next/og";

export const alt = "PDF-X — Free, Fast & 100% Private Client-Side PDF Utilities";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 90% 10%, #fdf2f4 0%, #ffffff 50%), radial-gradient(circle at 10% 90%, #fff9f2 0%, #ffffff 40%)",
          padding: "64px 80px",
          fontFamily: "sans-serif",
          border: "12px solid #800020",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "#800020",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "#171717",
                letterSpacing: "-0.03em",
              }}
            >
              PDF<span style={{ color: "#800020" }}>-X</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "#fdf2f4",
              border: "1px solid #f8cfd5",
              color: "#800020",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Client-Side Privacy Engine
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
          <h1
            style={{
              fontSize: "58px",
              fontWeight: 900,
              color: "#171717",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Combine, Split & Optimize PDFs <span style={{ color: "#800020" }}>Without Server Uploads</span>
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#525252",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            All document processing happens strictly inside your browser. Fast, free forever, and zero server storage.
          </p>
        </div>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", width: "100%" }}>
          {["Merge PDFs", "Split PDF", "Remove Pages", "Organize & Rotate", "Compress PDF"].map(
            (tool) => (
              <div
                key={tool}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #e5e5e5",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#262626",
                }}
              >
                {tool}
              </div>
            )
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid #e5e5e5",
            fontSize: "18px",
            color: "#737373",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <span>No file size limits</span>
            <span>No registration needed</span>
            <span>Works offline</span>
          </div>
          <span style={{ fontWeight: 700, color: "#800020" }}>pdfx.tharidulakmal.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
