import "./globals.css";

export const metadata = {
  title: "Dickens Manyama | Portfolio",
  description: "Software Developer & Data Scientist portfolio",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}

