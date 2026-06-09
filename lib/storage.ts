import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import cloudinary from "./cloudinary";

const USE_CLOUDINARY = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "puc-minas/cards";

/* ────────────────────────────────
   Local filesystem helpers (fallback)
   ──────────────────────────────── */

const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "cards");

function getExtension(file: File) {
  const filename = file.name || "image";
  const extension = path.extname(filename);
  if (extension) return extension.toLowerCase();
  return getExtensionFromMimeType(file.type);
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}

/* ────────────────────────────────
   Cloudinary helpers
   ──────────────────────────────── */

function buildPublicId(id: string, file: File) {
  const extension = getExtension(file);
  const cleanName = `${id}${extension}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${CLOUDINARY_FOLDER}/${cleanName}`;
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Remove a versão (v1234567890) se existir
    const relevant = pathParts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(relevant[0] ?? "")) {
      relevant.shift();
    }
    const fileName = relevant.pop()?.replace(/\.[^.]+$/, "");
    if (!fileName) return null;
    return [...relevant, fileName].join("/");
  } catch {
    return null;
  }
}

/* ────────────────────────────────
   Exports
   ──────────────────────────────── */

interface UploadResult {
  fileName: string;
  publicUrl: string;
}

export async function saveCardImage(file: File, id: string): Promise<UploadResult> {
  if (USE_CLOUDINARY) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = buildPublicId(id, file);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: publicId,
            folder: "", // publicId já contém a pasta
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return {
      fileName: path.basename(publicId),
      publicUrl: result.secure_url,
    };
  }

  // Fallback local
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

export async function saveCardImageDataUrl(dataUrl: string, id: string): Promise<UploadResult> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const [, mimeType, encoded] = match;
  const extension = getExtensionFromMimeType(mimeType);
  const fileName = `${id}${extension}`;

  if (USE_CLOUDINARY) {
    const buffer = Buffer.from(encoded, "base64");
    const publicId = `${CLOUDINARY_FOLDER}/${fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: publicId,
            folder: "",
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return {
      fileName: path.basename(publicId),
      publicUrl: result.secure_url,
    };
  }

  // Fallback local
  const filePath = path.join(UPLOAD_DIRECTORY, fileName);
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(filePath, Buffer.from(encoded, "base64"));

  return {
    fileName,
    publicUrl: `/uploads/cards/${fileName}`,
  };
}

export async function removeCardImage(publicUrl: string | null | undefined) {
  if (!publicUrl) return;

  if (USE_CLOUDINARY) {
    const publicId = extractPublicIdFromUrl(publicUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch {
        // Ignore Cloudinary errors on cleanup
      }
    }
    return;
  }

  // Fallback local
  if (!publicUrl.startsWith("/uploads/cards/")) return;

  const filePath = path.join(
    process.cwd(),
    "public",
    publicUrl.replace(/^\//, "")
  );

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files from previous runs or manual cleanup.
  }
}
