import Link from "next/link";
import { readBlogs } from "@/lib/db";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

// Dynamic SEO metadata generator
export async function generateMetadata({ params }) {
  const { id } = await params;
  const blogs = await readBlogs();
  const post = blogs.find((b) => b.id === id);

  if (!post) {
    return {
      title: "Article Not Found | Augnexis Technologies",
      description: "The requested blog article was not found."
    };
  }

  return {
    title: `${post.title} | Augnexis Insights`,
    description: post.excerpt.substring(0, 155),
    openGraph: {
      title: post.title,
      description: post.excerpt.substring(0, 155),
      images: [
        {
          url: post.image || "/logo-transparent.png",
          alt: post.title
        }
      ]
    }
  };
}

export default async function BlogDetails({ params }) {
  const { id } = await params;
  const blogs = await readBlogs();
  const post = blogs.find((b) => b.id === id);

  if (!post) {
    notFound();
  }

  // Structured Schema data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://augnexis.tech/blogs/${post.id}`
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image || "https://augnexis.tech/logo-transparent.png",
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Augnexis Technologies",
      "logo": {
        "@type": "ImageObject",
        "url": "https://augnexis.tech/logo-transparent.png"
      }
    },
    "datePublished": new Date(post.date).toISOString().split("T")[0]
  };

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container" style={{ maxWidth: "800px", paddingBottom: "6rem", paddingTop: "2rem" }}>
        <Link 
          href="/blogs" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-blue-secondary)", fontSize: "0.95rem", fontWeight: "600", marginBottom: "2rem" }}
        >
          <ArrowLeft size={16} /> Back to Insights
        </Link>

        <article>
          <header style={{ marginBottom: "2.5rem" }}>
            <span style={{
              color: 'var(--color-blue-secondary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: 'var(--color-blue-light)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)'
            }}>
              {post.category}
            </span>

            <h1 style={{ fontSize: "2.5rem", color: "var(--color-blue-deep)", fontWeight: "800", marginTop: "1.25rem", marginBottom: "1.25rem", lineHeight: "1.2" }}>
              {post.title}
            </h1>

            <div className="blog-card-meta" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1.25rem", margin: "0" }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> {post.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={14} /> By {post.author}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
          </header>

          {post.image && (
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "2.5rem", height: "400px" }}>
              <img 
                src={post.image} 
                alt={post.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
          )}

          <section style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", lineHeight: "1.8", whiteSpace: "pre-line" }}>
            {post.excerpt}
          </section>
        </article>
      </div>
    </div>
  );
}
