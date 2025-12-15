export const metadata = {
  title: "KLYNX Incident Dashboard",
  description: "Operational Incident Monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
          background: "#f9fafb",
        }}
      >
        {children}
      </body>
    </html>
  );
}

