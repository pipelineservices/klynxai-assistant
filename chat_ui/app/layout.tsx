import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/klynx-logo.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/klynx-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

