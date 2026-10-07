import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Transform } from "stream";
import type { Request, Response } from "express";

// Uploaded videos/images are kept on the server's own disk.
// UPLOAD_DIR should point to a folder outside the deploy directory so files survive redeploys.
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

export type UploadKind = "videos" | "images";

export const UPLOAD_LIMITS: Record<UploadKind, number> = {
  videos: 100 * 1024 * 1024, // 100MB
  images: 5 * 1024 * 1024, // 5MB
};

const ALLOWED_TYPES: Record<UploadKind, (type: string) => boolean> = {
  videos: (type) => type.startsWith("video/"),
  images: (type) => type.startsWith("image/"),
};

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

export class UploadError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function isUploadKind(value: string): value is UploadKind {
  return value === "videos" || value === "images";
}

function resolveFilePath(kind: UploadKind, id: string): string {
  if (!ID_PATTERN.test(id)) {
    throw new UploadError(400, "Invalid file id");
  }
  return path.join(UPLOAD_DIR, kind, id);
}

// Streams the raw request body to disk, enforcing type and size limits.
export async function saveUpload(kind: UploadKind, id: string, req: Request): Promise<void> {
  const filePath = resolveFilePath(kind, id);
  const contentType = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();

  if (!ALLOWED_TYPES[kind](contentType)) {
    throw new UploadError(415, "Unsupported file type");
  }

  const limit = UPLOAD_LIMITS[kind];
  const declaredLength = Number(req.headers["content-length"] || 0);
  if (declaredLength > limit) {
    throw new UploadError(413, "File too large");
  }

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  const tmpPath = `${filePath}.part`;
  let received = 0;
  const sizeGuard = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      if (received > limit) {
        callback(new UploadError(413, "File too large"));
        return;
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(req, sizeGuard, fs.createWriteStream(tmpPath));
    await fs.promises.writeFile(`${filePath}.json`, JSON.stringify({ contentType, size: received }));
    await fs.promises.rename(tmpPath, filePath);
  } catch (error) {
    await fs.promises.rm(tmpPath, { force: true });
    throw error;
  }
}

// Sends a stored file; res.sendFile handles Range requests so videos can be seeked.
export async function sendUpload(kind: UploadKind, id: string, res: Response): Promise<void> {
  let filePath: string;
  try {
    filePath = resolveFilePath(kind, id);
  } catch {
    res.sendStatus(404);
    return;
  }

  let contentType = "application/octet-stream";
  try {
    const meta = JSON.parse(await fs.promises.readFile(`${filePath}.json`, "utf8"));
    if (typeof meta.contentType === "string") contentType = meta.contentType;
  } catch {
    res.sendStatus(404);
    return;
  }

  res.type(contentType);
  res.sendFile(filePath, { maxAge: "1h" }, (err) => {
    if (err && !res.headersSent) {
      res.sendStatus((err as any).status || 404);
    }
  });
}
