// 1. Import your global stylesheet *first*
import "./globals.css"; 
import type { Metadata } from "next";
// 2. Try the '@next/font' import path, which was used in some versions
import { Inter } from "next/font/google";

// 3. Set up the 'Inter' font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // This creates the CSS variable
});

export const metadata: Metadata = {
  title: "Sports Dashboard",
  description: "A web-based sports app for US sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 4. Apply the font variable to the <html> tag
    <html 
      lang="en" 
      className={inter.variable} // This applies the font
      suppressHydrationWarning // This prevents a warning with the theme toggle
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

