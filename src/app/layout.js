import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Augnexis Technologies | Connecting Intelligence. Delivering Innovation.",
  description: "Augnexis Technologies is a premium digital transformation and engineering provider. We build AI integrations, cloud architecture, cybersecurity systems, and enterprise software solutions.",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} suppressHydrationWarning>
        <Navbar />
        <main style={{ flexGrow: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
