import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import archiver from "archiver";
import * as CryptoJS from "crypto-js";
import { nanoid } from "nanoid";
import { createWriteStream } from "fs";

export const dynamic = "force-dynamic";

interface FileMetadata {
  id: string;
  originalName: string;
  uploadedAt: number;
  expiresAt: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file || !password) {
      return NextResponse.json(
        { error: "File and password are required" },
        { status: 400 }
      );
    }

    // Create necessary directories
    const uploadsDir = path.join(process.cwd(), "uploads");
    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(downloadsDir)) {
      await mkdir(downloadsDir, { recursive: true });
    }

    // Generate unique ID
    const fileId = nanoid(10);
    
    // Save the uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join(uploadsDir, `${fileId}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    // Create zip archive
    const zipPath = path.join(uploadsDir, `${fileId}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Set password for the zip
    archive.append(buffer, { name: file.name });

    await new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      output.on("error", (err) => reject(err));
      archive.on("error", (err) => reject(err));

      archive.pipe(output);
      archive.finalize();
    });

    // Read the zip file and encrypt it
    const fs = require("fs");
    const zipBuffer = fs.readFileSync(zipPath);
    const zipBase64 = zipBuffer.toString("base64");
    
    // Encrypt the zip file content with the password
    const encrypted = CryptoJS.AES.encrypt(zipBase64, password).toString();

    // Save encrypted file
    const encryptedPath = path.join(downloadsDir, `${fileId}.enc`);
    await writeFile(encryptedPath, encrypted);

    // Save metadata
    const metadata: FileMetadata = {
      id: fileId,
      originalName: file.name,
      uploadedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    
    const metadataPath = path.join(downloadsDir, `${fileId}.meta.json`);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Clean up temporary files
    const fsSync = require("fs");
    if (fsSync.existsSync(tempFilePath)) {
      fsSync.unlinkSync(tempFilePath);
    }
    if (fsSync.existsSync(zipPath)) {
      fsSync.unlinkSync(zipPath);
    }

    return NextResponse.json({
      success: true,
      id: fileId,
      message: "File uploaded and encrypted successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
