import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lucky Saroj — Video Editor & Visual Storyteller",
    template: "%s — Lucky Saroj",
  },
  description:
    "Portfolio of Lucky Saroj, a freelance video editor specializing in YouTube documentaries, commercials, reels and motion graphics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={
        {
          "--font-poppins": "'Poppins', sans-serif",
          "--font-inter": "'Inter', sans-serif",
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
