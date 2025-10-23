"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file || !password) {
      setError("Please select a file and enter a password");
      return;
    }

    setUploading(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}/api/download/${data.id}`;
      setDownloadUrl(fullUrl);
      
      // Reset form
      setFile(null);
      setPassword("");
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Secure File Hosting
          </h1>
          <p className="text-gray-600">
            Upload files with password protection. Links expire in 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="file-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select File
              </label>
              <input
                id="file-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password to protect your file"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>

          {downloadUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800 mb-2">
                File uploaded successfully!
              </p>
              <p className="text-sm text-green-700 mb-2">
                Download link (expires in 24 hours):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={downloadUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(downloadUrl);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Save this URL and the password to download the file later.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            How it works:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">1.</span>
              <span>Select a file and set a password</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">2.</span>
              <span>File is compressed and encrypted with your password</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">3.</span>
              <span>Share the download link and password</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">4.</span>
              <span>Link expires automatically after 24 hours</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
