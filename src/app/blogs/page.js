"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="sub-title">INSIGHTS & ARTICLES</span>
          <h1 className="page-header-title">The Augnexis Blog</h1>
          <p className="page-header-desc">
            Explore guides, technical articles, and updates on cloud architecture, AI models, and enterprise software engineering.
          </p>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="text-center" style={{ padding: "4rem 2rem" }}>
              <div style={{
                border: "4px solid rgba(0, 102, 254, 0.1)",
                borderLeftColor: "var(--color-blue-secondary)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem"
              }}></div>
              <p style={{ color: "var(--color-text-secondary)" }}>Loading articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center" style={{ padding: "4rem 2rem" }}>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>No articles found. Check back later!</p>
            </div>
          ) : (
            <div className="grid-2">
              {posts.map((post) => (
                <div key={post.id} className="blog-card">
                  {post.image ? (
                    <div style={{ height: "220px", position: "relative", overflow: "hidden", borderTopLeftRadius: "var(--radius-lg)", borderTopRightRadius: "var(--radius-lg)" }}>
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                      <div style={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        color: 'var(--color-white)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: 'rgba(7, 15, 36, 0.6)',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {post.category}
                      </div>
                    </div>
                  ) : (
                    <div className="blog-card-image-placeholder" style={{ background: post.gradient }}>
                      <div style={{
                        color: 'var(--color-white)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: 'rgba(7, 15, 36, 0.4)',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {post.category}
                      </div>
                    </div>
                  )}
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
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
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div>
                      <Link href={`/blogs/${post.id}`} className="blog-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        Read Article <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
