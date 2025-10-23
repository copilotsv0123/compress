import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import * as CryptoJS from "crypto-js";

export const dynamic = "force-dynamic";

interface FileMetadata {
  id: string;
  originalName: string;
  uploadedAt: number;
  expiresAt: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const password = request.nextUrl.searchParams.get("password");

    if (!password) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enter Password</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 400px;
                width: 100%;
              }
              h1 {
                margin: 0 0 8px 0;
                color: #1f2937;
                font-size: 24px;
              }
              p {
                color: #6b7280;
                margin: 0 0 24px 0;
              }
              label {
                display: block;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
              }
              input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 16px;
                box-sizing: border-box;
              }
              input[type="password"]:focus {
                outline: none;
                border-color: #4f46e5;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
              }
              button {
                width: 100%;
                background: #4f46e5;
                color: white;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 16px;
              }
              button:hover {
                background: #4338ca;
              }
              .error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px;
                border-radius: 6px;
                margin-top: 16px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Protected File</h1>
              <p>Enter the password to download this file.</p>
              <form method="GET">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  autofocus
                  placeholder="Enter password"
                />
                <button type="submit">Download File</button>
              </form>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    const metadataPath = path.join(downloadsDir, `${fileId}.meta.json`);
    const encryptedPath = path.join(downloadsDir, `${fileId}.enc`);

    // Check if files exist
    if (!existsSync(metadataPath) || !existsSync(encryptedPath)) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>File Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 400px;
                width: 100%;
                text-align: center;
              }
              h1 {
                color: #dc2626;
                margin: 0 0 16px 0;
              }
              p {
                color: #6b7280;
              }
              a {
                display: inline-block;
                margin-top: 24px;
                color: #4f46e5;
                text-decoration: none;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>File Not Found</h1>
              <p>This file does not exist or has expired.</p>
              <a href="/">← Back to Upload</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Read and check metadata
    const metadataContent = await readFile(metadataPath, "utf-8");
    const metadata: FileMetadata = JSON.parse(metadataContent);

    // Check if file has expired
    if (Date.now() > metadata.expiresAt) {
      // Clean up expired files
      await unlink(metadataPath);
      await unlink(encryptedPath);

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>File Expired</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 400px;
                width: 100%;
                text-align: center;
              }
              h1 {
                color: #dc2626;
                margin: 0 0 16px 0;
              }
              p {
                color: #6b7280;
              }
              a {
                display: inline-block;
                margin-top: 24px;
                color: #4f46e5;
                text-decoration: none;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>File Expired</h1>
              <p>This file has expired and is no longer available for download.</p>
              <a href="/">← Back to Upload</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 410,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Read encrypted file
    const encryptedContent = await readFile(encryptedPath, "utf-8");

    try {
      // Decrypt the file
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, password);
      const decryptedBase64 = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedBase64) {
        throw new Error("Decryption failed");
      }

      // Convert from base64 to buffer
      const zipBuffer = Buffer.from(decryptedBase64, "base64");

      // Return the zip file
      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${metadata.originalName}.zip"`,
        },
      });
    } catch (error) {
      // Wrong password
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enter Password</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 400px;
                width: 100%;
              }
              h1 {
                margin: 0 0 8px 0;
                color: #1f2937;
                font-size: 24px;
              }
              p {
                color: #6b7280;
                margin: 0 0 24px 0;
              }
              label {
                display: block;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
              }
              input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 16px;
                box-sizing: border-box;
              }
              input[type="password"]:focus {
                outline: none;
                border-color: #4f46e5;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
              }
              button {
                width: 100%;
                background: #4f46e5;
                color: white;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 16px;
              }
              button:hover {
                background: #4338ca;
              }
              .error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px;
                border-radius: 6px;
                margin-top: 16px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Protected File</h1>
              <p>Enter the password to download this file.</p>
              <form method="GET">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  autofocus
                  placeholder="Enter password"
                />
                <button type="submit">Download File</button>
              </form>
              <div class="error">
                Incorrect password. Please try again.
              </div>
            </div>
          </body>
        </html>
        `,
        {
          status: 401,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
