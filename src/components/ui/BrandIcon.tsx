import { useId } from "react";

export type BrandNetwork =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "spotify"
  | "maps";

interface BrandIconProps {
  network: BrandNetwork;
  className?: string;
}

/**
 * Logos oficiales con sus colores originales de marca.
 */
export function BrandIcon({ network, className = "w-5 h-5" }: BrandIconProps) {
  const uid = useId();

  switch (network) {
    case "whatsapp":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <circle cx="16" cy="16" r="15" fill="#25D366" />
          <path
            fill="#FFFFFF"
            d="M16.1 7.6c-4.6 0-8.3 3.7-8.3 8.3 0 1.5.4 3 1.1 4.2L7.7 24.4l4.4-1.2c1.2.7 2.6 1 4 1 4.6 0 8.3-3.7 8.3-8.3s-3.7-8.3-8.3-8.3Zm4.9 11.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.4-.5.5-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"
          />
        </svg>
      );

    case "instagram": {
      const gradId = `ig-grad-${uid}`;
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <defs>
            <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="5%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="60%" stopColor="#d6249f" />
              <stop offset="90%" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="7"
            fill={`url(#${gradId})`}
          />
          <rect
            x="6.5"
            y="6.5"
            width="19"
            height="19"
            rx="5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
          />
          <circle
            cx="16"
            cy="16"
            r="4.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
          />
          <circle cx="21.6" cy="10.4" r="1.4" fill="#FFFFFF" />
        </svg>
      );
    }

    case "facebook":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <circle cx="16" cy="16" r="15" fill="#1877F2" />
          <path
            fill="#FFFFFF"
            d="M20.4 20.6l.6-4.2h-4v-2.7c0-1.1.6-2.3 2.4-2.3h1.8V7.8s-1.7-.3-3.3-.3c-3.4 0-5.6 2-5.6 5.8v3.1H8.6v4.2h3.7V30.8c.7.1 1.5.2 2.3.2s1.6-.1 2.3-.2V20.6h3.5Z"
          />
        </svg>
      );

    case "youtube":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <rect x="2" y="6" width="28" height="20" rx="5" fill="#FF0000" />
          <path fill="#FFFFFF" d="M13 11.5v9l8-4.5-8-4.5Z" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <rect x="2" y="2" width="28" height="28" rx="6" fill="#0F0F0F" />
          <path
            fill="#25F4EE"
            d="M21.2 12.1c-1.5-.3-2.6-1.5-2.8-3h-2.9v10.8c0 1.4-1.1 2.5-2.5 2.5-1.1 0-2-.7-2.4-1.7-.4.4-.6 1-.6 1.7 0 1.6 1.3 2.9 2.9 2.9 1.6 0 2.9-1.3 2.9-2.9v-7.5c1 .8 2.2 1.2 3.5 1.2v-4Z"
            transform="translate(-0.7 -0.6)"
          />
          <path
            fill="#FE2C55"
            d="M21.9 12.7c-1.5-.3-2.6-1.5-2.8-3h-2.9v10.8c0 1.4-1.1 2.5-2.5 2.5-1.4 0-2.5-1.1-2.5-2.5 0-1.4 1.1-2.5 2.5-2.5.3 0 .6.1.9.2v-3c-.3 0-.6-.1-.9-.1-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4v-5.4c1 .7 2.2 1.1 3.5 1.1v-3.5h-.7Z"
            transform="translate(0.6 0.6)"
          />
          <path
            fill="#FFFFFF"
            d="M21.5 12.4c-1.5-.3-2.6-1.5-2.8-3h-2.6v10.8c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6.1.9.2v-2.7c-.3 0-.6-.1-.9-.1-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2v-5.6c1 .7 2.2 1.1 3.5 1.1v-3.4h-.8Z"
          />
        </svg>
      );

    case "spotify":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <circle cx="16" cy="16" r="15" fill="#1DB954" />
          <path
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="2.4"
            strokeLinecap="round"
            d="M9.2 12.2c4.4-1.3 9.8-1 13.8 1.2M10.3 16.5c3.6-1 7.9-.7 11.2 1.1M11.4 20.5c2.8-.7 6.1-.5 8.7.9"
          />
        </svg>
      );

    case "maps":
      return (
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={`shrink-0 ${className}`}
        >
          <path
            fill="#EA4335"
            d="M16 3C10.5 3 6 7.5 6 13c0 2.3.8 4.5 2.2 6.3l7.8-9.3V3Z"
          />
          <path
            fill="#4285F4"
            d="M26 13c0-5.5-4.5-10-10-10v7l7.8 9.3c1.4-1.8 2.2-4 2.2-6.3Z"
          />
          <path
            fill="#FBBC05"
            d="M8.2 19.3c1.8 2.3 4.2 5.1 6.2 8.2L21 18l-5-5-7.8 6.3Z"
          />
          <path
            fill="#34A853"
            d="M14.4 27.5c.5.8.9 1.5 1.6 1.5.7 0 1.1-.7 1.6-1.5 2-3.1 4.4-5.9 6.2-8.2L21 16.5l-6.6 11Z"
          />
          <circle cx="16" cy="13" r="3.8" fill="#FFFFFF" />
        </svg>
      );
  }
}
