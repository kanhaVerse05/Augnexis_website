import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://augnexis.tech"),
  title: "Augnexis Technologies | Connecting Intelligence. Delivering Innovation.",
  description: "Augnexis Technologies is a premium digital transformation and engineering provider. We build AI integrations, cloud architecture, cybersecurity systems, and enterprise software solutions.",
  robots: "index, follow",
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Augnexis Technologies",
              "url": "https://augnexis.tech",
              "logo": "https://augnexis.tech/logo-transparent.png",
              "image": "https://augnexis.tech/logo.jpg",
              "description": "Augnexis Technologies is a premium software development company in Delhi, providing bespoke web, mobile, cloud, and AI-powered solutions.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "B - 155, Sainik Nagar, Uttam Nagar West",
                "addressLocality": "West Delhi",
                "addressRegion": "Delhi",
                "postalCode": "110059",
                "addressCountry": "IN"
              },
              "telephone": "+919540252590",
              "email": "info@augnexis.tech",
              "priceRange": "$$",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ],
                  "opens": "10:00",
                  "closes": "19:00"
                }
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+919540252590",
                "contactType": "sales & customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://www.instagram.com/augnexis/",
                "https://www.facebook.com/augnexis/"
              ]
            })
          }}
        />
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
