import Image, { type ImageProps } from "next/image";

import { darkSrc } from "@/lib/darkImages";

/**
 * `next/image`, plus the dark page's copy of the picture when there is one
 * (see darkImages.ts). Both are in the HTML and CSS shows one, so the right
 * picture is there on first paint with no script. The hidden one is
 * `display: none`, which a lazy image never downloads.
 */
export function ThemedImage({ className = "", alt, ...rest }: ImageProps) {
  const dark = typeof rest.src === "string" ? darkSrc(rest.src) : null;
  if (!dark) return <Image {...rest} alt={alt} className={className} />;
  return (
    <>
      <Image {...rest} alt={alt} className={`${className} theme-light-only`} />
      <Image {...rest} alt={alt} src={dark} className={`${className} theme-dark-only`} />
    </>
  );
}
