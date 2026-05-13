import "./globals.css";

export const metadata = {
  title: "Dickens Manyama | Portfolio",
  description: "Software Developer & Data Scientist portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}

