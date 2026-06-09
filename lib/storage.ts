import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "cards");

function getExtension(file: File) {
  const filename = file.name || "image";
  const extension = path.extname(filename);

  if (extension) {
    return extension.toLowerCase();
  }

  return getExtensionFromMimeType(file.type);
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}

export async function saveCardImage(file: File, id: string) {
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });

  const extension = getExtension(file);
  const fileName = `${id}${extension}`;
  const filePath = path.join(UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    fileName,
    publicUrl: `/uploads/cards/${fileName}`,
  };
}

export async function saveCardImageDataUrl(dataUrl: string, id: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const [, mimeType, encoded] = match;
  const extension = getExtensionFromMimeType(mimeType);
  const fileName = `${id}${extension}`;
  const filePath = path.join(UPLOAD_DIRECTORY, fileName);

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(filePath, Buffer.from(encoded, "base64"));

  return {
    fileName,
    publicUrl: `/uploads/cards/${fileName}`,
  };
}

export async function removeCardImage(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/cards/")) {
    return;
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    publicUrl.replace(/^\//, ""),
  );

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files from previous runs or manual cleanup.
  }
}
