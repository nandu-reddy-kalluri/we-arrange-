export interface GalleryItem {
  id?: string | number;
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
}

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.youmarriagewearrange.com/kunal-khade-films/image-1.webp";

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Dune Crests",
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2560&auto=format&fit=crop",
    alt: "Sculptural desert sand dunes with dramatic warm golden shadows",
  },
  {
    id: 2,
    title: "Canyon Glow",
    src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2560&auto=format&fit=crop",
    alt: "Smooth flowing sandstone slot canyon with rich terracotta tones",
  },
  {
    id: 3,
    title: "Golden Monolith",
    src: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?q=80&w=2560&auto=format&fit=crop",
    alt: "Towering desert rock formations in golden hour sunset light",
  },
  {
    id: 4,
    title: "Terracotta Ridges",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2560&auto=format&fit=crop",
    alt: "Vast desert canyon highway framed by warm red rock formations",
  },
  {
    id: 5,
    title: "Sahara Solitude",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop",
    alt: "Minimalist undulating sand dunes with deep warm contrast",
  },
  {
    id: 6,
    title: "Sedona Sunset",
    src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2560&auto=format&fit=crop",
    alt: "Warm amber horizon across rugged desert cliffs and plateau",
  },
];

export function normalizeGalleryItems(
  items: (string | GalleryItem)[] | undefined,
  fallbackSrc: string = DEFAULT_FALLBACK_IMAGE
): GalleryItem[] {
  if (!items || items.length === 0) {
    return [];
  }
  return items.map((item, idx) => {
    if (typeof item === "string") {
      return {
        id: `img-${idx}`,
        src: item || fallbackSrc,
        alt: `Gallery image ${idx + 1}`,
      };
    }
    return {
      id: item.id ?? `img-${idx}`,
      src: item.src || fallbackSrc,
      alt: item.alt || item.title || `Gallery image ${idx + 1}`,
      title: item.title,
      caption: item.caption,
    };
  });
}

export interface GridTemplateResult {
  cols: number;
  rows: number;
  gridTemplateColumns: string;
  gridTemplateRows: string;
}

export function calculateGridTemplate(
  count: number,
  hoveredIndex: number | null,
  isTouchDevice: boolean = false,
  expandFactor: number = 1.85
): GridTemplateResult {
  if (count <= 1) {
    return {
      cols: 1,
      rows: 1,
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
    };
  }

  if (count === 2) {
    const cols = 2;
    const rows = 1;
    if (hoveredIndex === null || isTouchDevice) {
      return { cols, rows, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" };
    }
    return {
      cols,
      rows,
      gridTemplateColumns:
        hoveredIndex === 0
          ? `${expandFactor}fr 0.9fr`
          : `0.9fr ${expandFactor}fr`,
      gridTemplateRows: "1fr",
    };
  }

  if (count === 3) {
    const cols = 3;
    const rows = 1;
    if (hoveredIndex === null || isTouchDevice) {
      return { cols, rows, gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr" };
    }
    return {
      cols,
      rows,
      gridTemplateColumns: Array.from({ length: 3 }, (_, c) =>
        c === hoveredIndex ? `${expandFactor}fr` : "0.9fr"
      ).join(" "),
      gridTemplateRows: "1fr",
    };
  }

  if (count === 4) {
    const cols = 2;
    const rows = 2;
    if (hoveredIndex === null || isTouchDevice) {
      return { cols, rows, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
    }
    const r = Math.floor(hoveredIndex / 2);
    const c = hoveredIndex % 2;
    return {
      cols,
      rows,
      gridTemplateColumns: Array.from({ length: 2 }, (_, colIdx) =>
        colIdx === c ? `${expandFactor}fr` : "0.9fr"
      ).join(" "),
      gridTemplateRows: Array.from({ length: 2 }, (_, rowIdx) =>
        rowIdx === r ? `${expandFactor}fr` : "0.9fr"
      ).join(" "),
    };
  }

  if (count === 5) {
    // 5-item showcase:
    // Item 0 is hero on left (spans 2 rows)
    // Items 1, 2 on top-right (cols 2, 3)
    // Items 3, 4 on bottom-right (cols 2, 3)
    const cols = 3;
    const rows = 2;
    if (hoveredIndex === null || isTouchDevice) {
      return {
        cols,
        rows,
        gridTemplateColumns: "1.4fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
    }
    if (hoveredIndex === 0) {
      return {
        cols,
        rows,
        gridTemplateColumns: `${expandFactor * 1.25}fr 0.85fr 0.85fr`,
        gridTemplateRows: "1fr 1fr",
      };
    }
    const r = hoveredIndex <= 2 ? 0 : 1;
    const c = hoveredIndex === 1 || hoveredIndex === 3 ? 1 : 2;
    return {
      cols,
      rows,
      gridTemplateColumns: Array.from({ length: 3 }, (_, colIdx) =>
        colIdx === c ? `${expandFactor}fr` : "0.85fr"
      ).join(" "),
      gridTemplateRows: Array.from({ length: 2 }, (_, rowIdx) =>
        rowIdx === r ? `${expandFactor}fr` : "0.9fr"
      ).join(" "),
    };
  }

  // count >= 6
  const cols = 3;
  const rows = 2;
  if (hoveredIndex === null || isTouchDevice) {
    return {
      cols,
      rows,
      gridTemplateColumns: "1fr 1fr 1fr",
      gridTemplateRows: "1fr 1fr",
    };
  }

  const hoveredRow = Math.floor(hoveredIndex / 3);
  const hoveredCol = hoveredIndex % 3;

  return {
    cols,
    rows,
    gridTemplateColumns: Array.from({ length: 3 }, (_, c) =>
      c === hoveredCol ? `${expandFactor}fr` : "0.9fr"
    ).join(" "),
    gridTemplateRows: Array.from({ length: 2 }, (_, r) =>
      r === hoveredRow ? `${expandFactor}fr` : "0.9fr"
    ).join(" "),
  };
}
