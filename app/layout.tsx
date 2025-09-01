import "./global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DropSource",
  description: "Song sketchpad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 font-sans antialiased">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}