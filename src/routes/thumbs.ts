// Synthetic images for the gallery: flat SVG gradients, no real content.
export function thumb(seed: number, width = 320, height = 180): string {
	const hue = (seed * 47) % 360;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 35% 38%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 30% 18%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width * 0.7}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.16}" fill="hsl(${hue} 40% 70% / 0.5)"/></svg>`;
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
