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
 * Botón principal de Ulular:
 * - primary: bloque en color de acento activo con halo luminoso, pulso LED en vivo y flecha reactiva.
 * - ghost: transparente con borde bone; en hover se invierte a bone con texto ink.
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
    "group relative overflow-hidden inline-flex items-center justify-center gap-3 min-h-[54px] px-7 font-display font-black text-[0.82rem] tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ulular-btn-buzz";

  const variantClasses =
    variant === "primary"
      ? "bg-accent text-white border-2 border-accent shadow-[0_0_26px_var(--theme-accent-soft),0_0_12px_var(--color-accent)] hover:brightness-110 hover:shadow-[0_0_36px_var(--color-accent)]"
      : "bg-transparent text-bone border border-bone hover:bg-bone hover:text-ink";

  const content = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      {withLed && (
        <span className="relative inline-flex items-center justify-center w-3.5 h-3.5 shrink-0">
          <span
            aria-hidden="true"
            style={{ borderRadius: "9999px" }}
            className="absolute inset-0 rounded-full bg-white animate-ping opacity-80"
          />
          <span
            aria-hidden="true"
            style={{ borderRadius: "9999px" }}
            className="relative w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff] transition-transform duration-200 group-hover:scale-125"
          />
        </span>
      )}
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="relative z-10 font-mono-specs text-sm leading-none transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      )}
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
