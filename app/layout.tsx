import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure File Hosting",
  description: "24-hour secure file hosting with encryption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
