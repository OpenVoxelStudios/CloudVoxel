export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
}

export function unformatBytes(format: string | null): number {
  if (!format) return 0;
  const [value, unit] = format.split(" ");
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = sizes.indexOf(unit);
  return i === -1 ? 0 : parseInt(value) * Math.pow(k, i);
}

export const sanitizedFilename = (filename: string): string => {
  const replaced = filename
    .replace(/[^a-zA-Z0-9._\s-]/g, "")
    .replace(/\.{2,}/g, ".");
  if (replaced.replaceAll(".", "").length === 0) return "";

  return replaced.length > 64 ? replaced.slice(0, 64) : replaced;
};
