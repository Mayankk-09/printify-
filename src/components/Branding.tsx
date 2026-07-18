import Image from "next/image";

type LogoVariant = "full" | "mark" | "tagline";

const LOGO_MAP: Record<LogoVariant, { src: string; alt: string }> = {
  full: { src: "/branding/logo-full.png", alt: "Printify logo" },
  mark: { src: "/branding/logo-mark.png", alt: "Printify mark" },
  tagline: { src: "/branding/logo-tagline.png", alt: "Printify logo with tagline" },
};

export default function Logo({
  variant = "full",
  width,
  height,
  className,
}: {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
}) {
  const logo = LOGO_MAP[variant];

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={width ?? 140}
      height={height ?? 40}
      className={className}
      priority
    />
  );
}
