# PDFella: Complete Project Features & Functional Specification

> **Overview:** PDFella is a free, fast, and 100% private client-side PDF utility suite. All PDF processing happens entirely inside the user's browser; no files are ever uploaded to any server.

---

## 1. Core Product Identity & Principles

- **100% Client-Side Privacy:** Zero server uploads. Files remain strictly on the user's device, ensuring total privacy for sensitive legal, financial, or personal documents.
- **No Sign-Up & No Limits:** Instant access without accounts, subscriptions, watermarks, or artificial file limits.
- **Offline Capable:** Works without an active internet connection once loaded in the browser.
- **Created By:** Created by **Tharidu Lakmal** (`https://tharidulakmal.com`).

---

## 2. Feature 1: PDF Merger (Combine Multiple PDFs)

The PDF Merger allows users to combine multiple separate PDF documents into a single unified file with total control over document sequencing.

### Key Capabilities
- **Multi-File Upload:**
  - Drag and drop multiple PDF files simultaneously into the upload zone.
  - Traditional file picker supporting multi-selection.
- **Visual File Cards & Metadata:**
  - Displays every uploaded document with its filename, exact file size (KB/MB), and total page count.
  - Automatically generates a visual preview thumbnail of the first page of each document.
  - Fallback icon preview if a document cannot be previewed visually.
- **Dual Display Modes:**
  - **Grid View:** Visual card layout with large page-one thumbnails.
  - **List View:** Compact, detailed list view showing metadata and quick action buttons.
- **Document Reordering:**
  - **Drag-and-Drop Sequencing:** Drag file cards directly to re-arrange the merge sequence.
  - **One-Click Arrow Controls:** Move items up or down with dedicated arrow buttons for precise ordering.
- **Queue Management:**
  - Remove individual files from the merge queue.
  - Clear entire queue with a single click.
  - Add additional files to an existing queue at any time.
- **Merge Operation & Download:**
  - Validates that at least 2 PDF documents are loaded.
  - Sequentially combines all pages in the chosen order into a new document.
  - Automatically triggers browser download with a timestamped filename (`merged-pdf-YYYY-MM-DD.pdf`).
  - Real-time toast notifications for processing progress and completion.

---

## 3. Feature 2: PDF Splitter (Extract Pages & Ranges)

The PDF Splitter enables users to extract specific pages or custom page ranges from a document to create a new, focused PDF file.

### Key Capabilities
- **Single File Upload:** Upload any PDF document via drag-and-drop or file selector.
- **Document Overview:**
  - Displays original document name, total page count, and file size.
- **Dual Preview Modes:**
  - **Performance / Fast Mode (Default):** Generates lightweight, stylized page cards with page numbers for instant loading, ideal for large documents (100+ pages).
  - **Real Preview Mode:** Generates high-fidelity visual thumbnails of each individual page in the document.
- **Interactive Visual Page Selection:**
  - Click any page thumbnail to select or deselect it.
  - Visual selection indicators (highlighted borders, checkmarks, page tags).
  - "Select All" and "Clear Selection" quick actions.
- **Flexible Text Range Input:**
  - Input field supporting flexible page numbering syntax:
    - Single pages: `1, 3, 5`
    - Contiguous page ranges: `1-5` (pages 1 through 5)
    - Complex mixed syntax: `1-3, 5, 8-12`
  - **Two-Way Live Sync:** Clicking page cards automatically updates the range input; typing in the range box instantly highlights corresponding page cards.
- **Smart Validation:**
  - Validates input against total document pages (e.g., flags page 25 as invalid if the document only has 10 pages).
  - Automatically deduplicates and sorts selected pages in numerical order.
  - Prevents empty extractions (alerts user if no valid pages are selected).
- **Large File Optimization & Warnings:**
  - User confirmation prompt before extracting from very large files (>75MB or >500 pages).
  - Progressive batch extraction to prevent browser lag.
- **Extraction & Download:**
  - Assembles the selected pages into a new PDF document.
  - Automatically downloads as `[OriginalFileName]-pages-[SelectedRange].pdf`.

---

## 4. Feature 3: PDF Page Remover (Delete Unwanted Pages)

The PDF Page Remover allows users to delete specific unnecessary or sensitive pages from a PDF, producing a clean, pruned document.

### Key Capabilities
- **Single File Upload:** Drag-and-drop or select any PDF document to prune.
- **Document Inspection:**
  - Shows file name, file size, and total page count.
  - Generates page cards for every page with preview options (Fast placeholder vs Real visual thumbnails).
- **Page Deletion Selection:**
  - Click on pages to mark them for removal (styled with distinctive red/danger indicators).
  - Enter pages or ranges to remove via text input (e.g., `2, 4-6`).
  - Two-way sync between text input and visual card selection.
- **Critical Safety Guardrails:**
  - **All-Page Deletion Prevention:** Rejects operations that would delete every page, ensuring at least one page remains in the output document.
  - **Boundary Validation:** Rejects page numbers that exceed the document's total page count.
- **Inverse Extraction & Download:**
  - Automatically determines all remaining pages to retain.
  - Builds and saves the cleaned document without the deleted pages.
  - Automatically downloads the file named `[OriginalFileName]_pages_removed.pdf`.
  - Displays a summary toast confirming the number of pages removed and pages remaining.

---

## 5. Feature 4: Images to PDF (Convert JPG, PNG & WebP to PDF)

The Images to PDF utility converts multiple image files into a single, standardized, professional PDF document.

### Key Capabilities
- **Multi-Format Image Support:** Upload JPG, PNG, WebP, or BMP images via drag-and-drop or file selector.
- **Reorderable Visual Gallery:**
  - Card gallery showing thumbnail preview, exact file dimensions, and file size.
  - Reorder items up/down or remove individual images.
- **Customizable Layout Controls:**
  - **Page Size:** Fit to Image (preserves original dimensions), A4 (210 × 297 mm), or US Letter (8.5 × 11 in).
  - **Orientation:** Auto (smart ratio matching), Portrait, or Landscape.
  - **Margins:** No Margin (full bleed), Small (20pt), or Large (40pt).
- **Client-Side Export:** Assembles clean PDF document with embedded images and triggers download.

---

## 6. Feature 5: PDF to Images (High-Res JPG/PNG & ZIP Export)

The PDF to Images tool extracts individual pages of a PDF document into crisp, high-resolution standalone images.

### Key Capabilities
- **Dual Export Formats:**
  - **PNG:** Lossless format for sharp typography and vector graphics.
  - **JPG:** Compact format with high image quality.
- **Resolution Control:** Standard (150 DPI) or High-Resolution (300 DPI).
- **Interactive Page Grid:** Progressive page thumbnail rendering with selection checkboxes.
- **Single or Batch Download:**
  - Download individual page images on demand.
  - "Download Selected as ZIP" bundles all chosen pages into a single uncompressed ZIP archive generated entirely in-browser.

---

## 7. Feature 6: Add Page Numbers (Bates & Header/Footer Numbering)

The Page Numbers tool stamps clean page numbering across documents with customizable placement and formatting.

### Key Capabilities
- **6-Quadrant Positioning:** Bottom Center, Bottom Right, Bottom Left, Top Center, Top Right, Top Left.
- **Customizable Number Formats:** `Page X of Y`, `X / Y`, `X`, or `Page X`.
- **Styling Options:** Adjustable font size (9pt–18pt) and color presets (Dark Gray, Deep Black, Muted Gray, Burgundy).
- **Cover Page Skip:** Exclude the first/title page from numbering.
- **Start Number Offset:** Set custom starting sequence numbers.
- **Real-Time Interactive Preview:** Visual thumbnail mockup showing live position and typography.

---

## 8. Feature 7: Watermark PDF (Confidential Stamps & Image Logos)

The Watermark PDF tool stamps customized text or logo watermarks onto PDF pages to protect sensitive documents.

### Key Capabilities
- **Text Watermark Mode:**
  - Custom text input with 1-click presets: `CONFIDENTIAL`, `DRAFT`, `SAMPLE`, `COPY`, `URGENT`, `ORIGINAL`.
  - Adjustable font size (24pt–80pt), colors, rotation (-45°, 0°, 45°), and opacity (10%–80%).
- **Image / Logo Stamp Mode:**
  - Upload PNG/JPG brand logos or official stamps.
  - Scale adjustment and transparency controls.
- **Cover Page Skip:** Option to leave the document title page clean.
- **Real-Time Superimposed Preview:** Live mockup reflecting text/logo, angle, color, and opacity.

---

## 9. Universal Platform & UX Features

### 5.1 Responsive Glassmorphism Design
- **Color-Coded Tool Themes:**
  - **Blue Theme:** PDF Merger (accented with cyan and indigo highlights).
  - **Green Theme:** PDF Splitter (accented with emerald and teal highlights).
  - **Red Theme:** PDF Page Remover (accented with rose and coral highlights).
- **Mobile-First Layout:**
  - Mobile header with collapsible navigation dropdown.
  - Compact mode switch pills optimized for touch targets.
  - Full-width responsive dropzones and grids adapting across smartphones, tablets, and desktop displays.

### 5.2 File Security & Input Validation
- **Magic Byte Verification:** Checks binary file headers (`%PDF`) to ensure the file is an authentic PDF and prevent extension spoofing.
- **File Size Cap:** Enforces a 100MB maximum file size limit per document with clear user notifications.
- **Malicious Pattern Filtering:** Rejects dangerous executable patterns (`.exe`, `.bat`, `.cmd`, `.vbs`, etc.).
- **Filename Sanitization:** Strips unsafe characters and path traversal patterns from download filenames.

### 5.3 System Performance & Anti-Freeze Safeguards
- **Browser Memory Monitoring:**
  - Tracks browser JavaScript heap memory usage in real time.
  - Displays a warning banner when memory pressure exceeds 80%, recommending users close inactive browser tabs to prevent performance issues.
- **Adaptive Thumbnail Rendering:**
  - Dynamically downscales canvas dimensions and thumbnail image quality if system memory is constrained.
  - Falls back to lightweight vector cards if memory is low.
- **Cancellation & Tab Switching Safety:**
  - Automatically cancels background thumbnail rendering if the user switches to a different tool or uploads a new file, preventing background CPU or memory spikes.
- **Off-Thread Processing:**
  - Uses dedicated web workers for PDF rendering to keep the user interface smooth and responsive.

### 5.4 User Guidance & Error Handling
- **Informative Empty States:** Each tool displays visual step-by-step instructions and tips before any file is uploaded.
- **Live Status Toasts:** Comprehensive toast messages with loaders for file reading, parsing, batch extraction, and download status.
- **Resilient Error Recovery:** Built-in error boundaries catch unexpected file errors and offer simple "Try Again" or "Refresh" actions without losing app state.

---

## 6. Ecosystem & Navigation

- **Navigation & Links:** Direct links to documentation, privacy policy, and author website:
  - **Website:** `https://tharidulakmal.com`
- **Footer:** Direct links to author website, privacy policy, and copyright attribution.
