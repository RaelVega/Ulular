"use client";

import Link from "next/link";
import {
  useRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

export type ButtonVariant = "primary" | "ghost";

interface BaseProps {
  variant?: ButtonVariant;
  withLed?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function spawnSonarRipple(el: HTMLElement, clientX: number, clientY: number) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  for (let k = 0; k < 2; k++) {
    const span = document.createElement("span");
    span.className =
      k === 1 ? "ulular-ripple ulular-ripple-delayed" : "ulular-ripple";
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    el.appendChild(span);
    window.setTimeout(() => span.remove(), 900);
  }
}

/**
 * Botón monocromo de Ulular (DESIGN.md §7):
 * - primary: bloque bone con texto ink; en hover invierte a contorno; incluye LED circular opcional.
 * - ghost: transparente con borde bone; en hover se invierte a bone con texto ink.
 * - Onda de toque A4 (sonar) al presionar.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    withLed = variant === "primary",
    children,
    className = "",
    ...rest
  } = props;

  const ref = useRef<HTMLElement | null>(null);

  const baseClasses =
    "group relative overflow-hidden inline-flex items-center justify-center gap-3 min-h-[52px] px-6 font-display font-extrabold text-[0.78rem] tracking-[0.14em] uppercase border border-bone transition-colors duration-200 cursor-pointer select-none active:scale-[0.98] ulular-btn-buzz";

  const variantClasses =
    variant === "primary"
      ? "bg-bone text-ink hover:bg-accent hover:text-white hover:border-accent shadow-[0_0_24px_var(--theme-accent-soft)]"
      : "bg-transparent text-bone hover:bg-bone hover:text-ink";

  const content = (
    <>
      {withLed && (
        <span className="relative inline-flex items-center justify-center w-3 h-3">
          <span
            aria-hidden="true"
            style={{ borderRadius: "9999px" }}
            className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75"
          />
          <span
            aria-hidden="true"
            style={{ borderRadius: "9999px" }}
            className="relative w-2.5 h-2.5 rounded-full bg-accent border border-accent transition-transform duration-200 group-hover:bg-white group-hover:border-white group-hover:scale-125"
          />
        </span>
      )}
      <span className="relative z-10">{children}</span>
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, external, onClick, ...anchorRest } = rest;
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (ref.current) {
        spawnSonarRipple(ref.current, e.clientX, e.clientY);
      }
      onClick?.(e);
    };

    if (external || href.startsWith("http") || href.startsWith("https://wa.me")) {
      return (
        <a
          ref={(node) => {
            ref.current = node;
          }}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`${baseClasses} ${variantClasses} ${className}`.trim()}
          {...anchorRest}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        ref={(node) => {
          ref.current = node;
        }}
        href={href}
        onClick={handleClick}
        className={`${baseClasses} ${variantClasses} ${className}`.trim()}
        {...anchorRest}
      >
        {content}
      </Link>
    );
  }

  const { onClick, type = "button", ...buttonRest } = rest as ButtonAsButton;

  return (
    <button
      ref={(node) => {
        ref.current = node;
      }}
      type={type}
      onClick={(e) => {
        if (ref.current) {
          spawnSonarRipple(ref.current, e.clientX, e.clientY);
        }
        onClick?.(e);
      }}
      className={`${baseClasses} ${variantClasses} ${className}`.trim()}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
