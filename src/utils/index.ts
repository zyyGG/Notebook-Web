import type { IconOption } from "./type";

const icons = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function getIcon(options: IconOption) {
  let { name, color, width, height, size } = { ...options };

  name = `${name.split('.svg')[0]}.svg`
  color = color || "white";
  width = width || 32;
  height = height || width || 32;
  size = size || 1;

  const baseUrl = "../assets/icons/";
  const svg = icons[`${baseUrl}${name}`];
  if (!svg) {
    throw new Error(`Icon not found: ${name}`);
  }
  const sizedSvg = svg.replace(/<svg\b[^>]*>/, (tag) => {
    const setAttribute = (name: string, value: number) => {
      const pattern = new RegExp(`(\\s${name}\\s*=\\s*)(["']).*?\\2`);

      return pattern.test(tag)
        ? tag.replace(pattern, `$1"${value}"`)
        : tag.replace(/>$/, ` ${name}="${value}">`);
    };

    tag = setAttribute("width", width * size);
    tag = setAttribute("height", height * size);
    return tag;
  });

  const coloredSvg = sizedSvg.replaceAll("currentColor", color);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(coloredSvg)}`;
}
