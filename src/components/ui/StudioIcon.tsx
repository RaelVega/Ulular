export type StudioIconName =
  | "drums"
  | "amps"
  | "pa"
  | "mics"
  | "ac"
  | "acoustics"
  | "instruments"
  | "record"
  | "live"
  | "camera"
  | "calendar"
  | "clock"
  | "external"
  | "plus"
  | "edit"
  | "trash"
  | "settings"
  | "dashboard"
  | "back"
  | "expand";

export function StudioIcon({
  name,
  className = "w-5 h-5",
}: {
  name: StudioIconName;
  className?: string;
}) {
  const baseProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: `shrink-0 ${className}`,
  };

  switch (name) {
    case "drums":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="14" r="6" />
          <circle cx="12" cy="14" r="2" />
          <path d="M4 7h6M14 7h6M7 7v4M17 7v4M3 3l7 5M21 3l-7 5" />
        </svg>
      );

    case "amps":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <circle cx="7" cy="6.5" r="0.8" fill="currentColor" />
          <circle cx="10.5" cy="6.5" r="0.8" fill="currentColor" />
          <circle cx="14" cy="6.5" r="0.8" fill="currentColor" />
          <circle cx="9" cy="14.5" r="3" />
          <circle cx="15.5" cy="14.5" r="3" />
        </svg>
      );

    case "pa":
      return (
        <svg {...baseProps}>
          <line x1="6" y1="4" x2="6" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="18" y1="4" x2="18" y2="20" />
          <rect x="4" y="8" width="4" height="3" fill="currentColor" />
          <rect x="10" y="13" width="4" height="3" fill="currentColor" />
          <rect x="16" y="6" width="4" height="3" fill="currentColor" />
        </svg>
      );

    case "mics":
      return (
        <svg {...baseProps}>
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      );

    case "ac":
      return (
        <svg {...baseProps}>
          <path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "acoustics":
      return (
        <svg {...baseProps}>
          <path d="M2 12h2l2.5-6 3 12 3-14 3 16 2.5-8H22" />
        </svg>
      );

    case "instruments":
      return (
        <svg {...baseProps}>
          <path d="m14.5 9.5 6-6M18 2l4 4" />
          <path d="M11.5 8.5c-2.5 0-4 1.5-4.5 3.5-.5 1-2.5 1.5-3.5 3-1.2 1.8-.8 4.2.9 5.9 1.7 1.7 4.1 2.1 5.9.9 1.5-1 2-3 3-3.5 2-.5 3.5-2 3.5-4.5l-5.3-5.3Z" />
          <circle cx="9.5" cy="15.5" r="1.2" />
        </svg>
      );

    case "record":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
        </svg>
      );

    case "live":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" />
        </svg>
      );

    case "camera":
      return (
        <svg {...baseProps}>
          <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="17" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
      );

    case "clock":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15.5 14" />
        </svg>
      );

    case "external":
      return (
        <svg {...baseProps}>
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      );

    case "plus":
      return (
        <svg {...baseProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "edit":
      return (
        <svg {...baseProps}>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
        </svg>
      );

    case "trash":
      return (
        <svg {...baseProps}>
          <path d="M3 6h18M8 6V4h8v2M6 6v14h12V6M10 10v6M14 10v6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );

    case "dashboard":
      return (
        <svg {...baseProps}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );

    case "back":
      return (
        <svg {...baseProps}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );

    case "expand":
      return (
        <svg {...baseProps}>
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      );
  }
}
