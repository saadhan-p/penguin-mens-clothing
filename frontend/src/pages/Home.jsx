import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProducts, getSiteConfig } from '../services/api'
import ProductCard from '../components/ProductCard'

// High-definition fashion hero banners inspired by Snitch & Souled Store
const HERO_SLIDES = [
  {
    id: 1,
    tag: 'NEW FW25 CAPSULE // DROP 01',
    title: 'THE STREETWEAR & LINEN EDIT',
    subtitle: 'Relaxed silhouettes, heavyweight French terry, and crisp Japanese poplin tailored for modern everyday movement.',
    cta: 'SHOP COLLECTION',
    link: '/collection/shirts',
    img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 2,
    tag: 'NEW ARRIVALS 2025',
    title: 'VARSITY & STRUCTURED KNITWEAR',
    subtitle: 'Oversized varsity pullovers, textured cable knits, and relaxed layered silhouettes crafted for all-season comfort.',
    cta: 'EXPLORE NEW ARRIVALS',
    link: '/collection',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 3,
    tag: 'DAILY ESSENTIALS',
    title: 'LUXE OVERSIZED & SHIRTS',
    subtitle: 'High-density organic cotton tees, relaxed camp collars, and pleated trousers crafted with meticulous atelier precision.',
    cta: 'DISCOVER BESTSELLERS',
    link: '/collection/shirts',
    img: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=1920&auto=format&fit=crop'
  }
]

// Interactive Bento Categories (Matching Mobile Categories exactly)
const BENTO_CATEGORIES = [
  {
    id: 'shirts',
    title: 'Shirts',
    subtitle: '100% Pure linen, formal crisp cuts & relaxed camp collars.',
    tag: 'SIGNATURE EDIT',
    spanClass: 'bento-span-6',
    path: '/collection/shirts',
    img: '/categories/shirts.jpg',
    badge: 'POPULAR EDIT',
  },
  {
    id: 'trousers',
    title: 'Trousers',
    subtitle: 'Ergonomic pleated trousers, tailored chinos & smart formal pants.',
    tag: 'TAILORING',
    spanClass: 'bento-span-6',
    path: '/collection/tailoring',
    img: '/categories/trousers.jpg',
    badge: 'TAILORED FIT',
  },
  {
    id: 'tshirts',
    title: 'T-Shirts',
    subtitle: 'Heavyweight 240+ GSM oversized drops and architectural minimal tees.',
    tag: 'STREETWEAR',
    spanClass: 'bento-span-4',
    path: '/collection/tees',
    img: '/categories/tshirts.jpg',
    badge: 'TRENDING',
  },
  {
    id: 'jeans',
    title: 'Jeans',
    subtitle: 'Relaxed raw, vintage washes & premium selvedge cotton denim.',
    tag: 'DENIM CAPSULE',
    spanClass: 'bento-span-4',
    path: '/collection/jeans',
    img: '/categories/jeans.jpg',
    badge: '14 OZ DENIM',
  },
  {
    id: 'cargos',
    title: 'Cargos',
    subtitle: 'Utility parachute pants, tactical pockets & stretch fit.',
    tag: 'UTILITY',
    spanClass: 'bento-span-4',
    path: '/collection/tailoring',
    img: '/categories/cargos.jpg',
    badge: 'NEW ARRIVAL',
  },
  {
    id: 'polos',
    title: 'Polos',
    subtitle: 'Textured knit polo shirts, resort zip & classic collars.',
    tag: 'KNITWEAR',
    spanClass: 'bento-span-3',
    path: '/collection/shirts',
    img: '/categories/polos.jpg',
  },
  {
    id: 'outerwear',
    title: 'Outerwear',
    subtitle: 'Technical varsity jackets, bombers & structured coats.',
    tag: 'OUTERWEAR',
    spanClass: 'bento-span-3',
    path: '/collection/jackets',
    img: '/categories/outerwear.jpg',
  },
  {
    id: 'plussize',
    title: 'Plus Size',
    subtitle: 'Relaxed fits engineered with precision in sizes 2XL to 5XL.',
    tag: 'INCLUSIVE',
    spanClass: 'bento-span-3',
    path: '/collection',
    img: '/categories/plussize.jpg',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Caps, belts, socks & curated everyday lifestyle essentials.',
    tag: 'LIFESTYLE',
    spanClass: 'bento-span-3',
    path: '/collection',
    img: '/categories/accessories.png',
  },
]

// Minimal Clean Mobile Categories (Snitch Style)
const MOBILE_CATEGORIES = [
  { id: 'shirts',      title: 'SHIRTS',      path: '/collection/shirts',      img: '/categories/shirts.png' },
  { id: 'trousers',    title: 'TROUSERS',    path: '/collection/tailoring',   img: '/categories/trousers.png' },
  { id: 'tshirts',     title: 'T-SHIRTS',    path: '/collection/tees',        img: '/categories/tshirts.png' },
  { id: 'jeans',       title: 'JEANS',       path: '/collection/jeans',       img: '/categories/jeans.png' },
  { id: 'cargos',      title: 'CARGOS',      path: '/collection/tailoring',   img: '/categories/cargos.png' },
  { id: 'polos',       title: 'POLOS',       path: '/collection/shirts',      img: '/categories/polos.png' },
  { id: 'outerwear',   title: 'OUTERWEAR',   path: '/collection/jackets',     img: '/categories/outerwear.png' },
  { id: 'plussize',    title: 'PLUS SIZE',   path: '/collection/shirts',      img: '/categories/plussize.png' },
  { id: 'accessories', title: 'ACCESSORIES', path: '/collection/accessories', img: '/categories/accessories.png' },
]

const CATALOG_TABS = ['All', 'Shirts', 'Tees', 'Jeans', 'Jackets', 'Tailoring', 'Formals']

export default function HomePage() {
  const navigate = useNavigate()
  const { isWishlisted, toggleWishlist } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState('All')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroSlides, setHeroSlides] = useState(HERO_SLIDES)
  const [activeDrops, setActiveDrops] = useState([])

  const newArrivalsTrackRef = useRef(null)

  // Scroll New Arrivals carousel horizontally
  const scrollNewArrivals = (direction) => {
    if (newArrivalsTrackRef.current) {
      const scrollAmount = newArrivalsTrackRef.current.clientWidth * 0.75
      newArrivalsTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Load site config (hero slides + drops)
  useEffect(() => {
    getSiteConfig().then(res => {
      if (res?.data) {
        const slides = res.data.heroSlides
        if (slides && slides.length > 0) setHeroSlides(slides)
        const drops = (res.data.drops || []).filter(d => d.isVisible)
        setActiveDrops(drops)
      }
    }).catch(() => {})
  }, [])

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  // Load products from backend API
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true)
      try {
        const res = await getProducts()
        if (res?.data) {
          const formatted = res.data.map(p => ({
            id: p._id || p.id,
            name: p.name,
            category: p.category,
            color: p.color,
            price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 1999,
            originalPrice: p.originalPrice,
            badge: p.badge,
            isFeatured: p.isFeatured,
            isWinterDrop: p.isWinterDrop,
            rating: p.rating || '4.8',
            reviewsCount: p.reviewsCount || 120,
            images: p.images && p.images.length > 0 ? p.images : (p.img ? [p.img] : [])
          }))
          setProducts(formatted)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.warn('Could not load products on Home page')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCatalog()
  }, [])

  const newArrivals = products.filter(p => p.badge?.toLowerCase().includes('new') || p.badge?.toLowerCase().includes('drop') || p.isFeatured)
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(0, 8)

  // Filter products for the bottom catalog section
  const filteredProducts = activeTab === 'All'
    ? products
    : products.filter(p => p.category && p.category.toLowerCase() === activeTab.toLowerCase())

  return (
    <div className="homepage-container" style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 64 }}>
      {/* ─── 1. HERO CAROUSEL ─────────────────────────────────────────────── */}
      <section className="hero-slider-section">
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide
          return (
            <div
              key={slide.id || index}
              className={`hero-slide-item ${isActive ? 'active' : ''}`}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="hero-slide-bg-img"
              />
              <div className="hero-slide-overlay" />

              <div className="hero-slide-content">
                <h1 className="hero-title-main">
                  {slide.title}
                </h1>

                <div className="hero-cta-row">
                  <button
                    onClick={() => navigate(slide.link || '/collection')}
                    className="hero-cta-btn"
                  >
                    <span>{slide.cta || 'SHOP NOW'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Carousel Nav Arrows */}
        <button
          className="slider-arrow-btn prev desktop-only"
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          aria-label="Previous Slide"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          className="slider-arrow-btn next desktop-only"
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          aria-label="Next Slide"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>

        {/* Dots */}
        <div className="slider-dots-container">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`slider-dot-btn ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── 2. NEW ARRIVALS (Horizontal Slider) ──────── */}
      {displayNewArrivals.length > 0 && (
        <section className="content-container new-arrivals-section-wrap">
          <div className="new-arrivals-header-flex">
            <div>
              <span className="new-arrivals-pretitle">FRESH DROPS</span>
              <h2 className="new-arrivals-heading-title">NEW ARRIVALS</h2>
            </div>
            <button
              onClick={() => navigate('/collection?sort=newest')}
              className="new-arrivals-view-all-link"
              aria-label="View all new arrivals"
            >
              <span>VIEW ALL</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>

          <div className="new-arrivals-slider-wrapper">
            {/* Left Arrow Button */}
            <button
              className="new-arrivals-slider-nav-btn prev-btn"
              onClick={() => scrollNewArrivals('left')}
              aria-label="Previous New Arrivals"
              title="Scroll Left"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_left</span>
            </button>

            {/* Product Cards Track */}
            <div className="new-arrivals-track no-scrollbar" ref={newArrivalsTrackRef}>
              {displayNewArrivals.map((item) => (
                <div
                  key={item.id}
                  className="new-arrivals-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="new-arrivals-media-container">
                    <img src={item.images?.[0] || item.img || ''} alt={item.name} className="new-arrivals-img" loading="lazy" />
                    {item.badge && (
                      <span className="new-arrivals-badge-tag">
                        {item.badge}
                      </span>
                    )}
                    <button
                      className={`new-arrivals-wish-btn ${isWishlisted(item.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(item.id)
                      }}
                      aria-label="Wishlist"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          fontVariationSettings: isWishlisted(item.id) ? "'FILL' 1" : "'FILL' 0",
                          color: isWishlisted(item.id) ? 'var(--brand-accent)' : 'inherit'
                        }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="new-arrivals-details">
                    <h3 className="new-arrivals-title">{item.name}</h3>
                    <p className="new-arrivals-subtitle">{item.category || 'Atelier Garment'}</p>
                    <div className="new-arrivals-price-row">
                      <span className="new-arrivals-price-main">₹ {item.price ? Number(item.price).toLocaleString('en-IN') : '1,999'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow Button */}
            <button
              className="new-arrivals-slider-nav-btn next-btn"
              onClick={() => scrollNewArrivals('right')}
              aria-label="Next New Arrivals"
              title="Scroll Right"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_right</span>
            </button>
          </div>
        </section>
      )}

      {/* ─── 3. CATEGORIES: DESKTOP BENTO & MOBILE CLEAN MINIMAL GRID ─ */}
      <section className="content-container bento-glass-section desktop-only">
        <div className="bento-header-center">
          <h2 className="new-arrivals-heading-title">
            SHOP BY CATEGORY
          </h2>
        </div>

        <div className="bento-grid-modern">
          {BENTO_CATEGORIES.map((item) => (
            <div
              key={item.id}
              className={`bento-card-glass ${item.spanClass}`}
              onClick={() => navigate(item.path)}
            >
              <img
                src={item.img}
                alt={item.title}
                className="bento-card-bg-img"
                loading="lazy"
              />
              <div className="bento-glass-overlay" />

              {item.badge && (
                <span className="bento-top-badge">
                  {item.badge}
                </span>
              )}

              {item.count && (
                <span className="bento-count-badge">
                  {item.count}
                </span>
              )}

              <div className="bento-card-content">
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {item.tag}
                </span>
                <h3 className="bento-category-title">{item.title}</h3>
                {item.subtitle && (
                  <p className="bento-category-subtitle">{item.subtitle}</p>
                )}
                <div className="bento-explore-cta">
                  <span className="bento-explore-cta-pill">
                    Explore Collection
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3b. MINIMAL CLEAN CATEGORIES GRID (Mobile View) ────────────── */}
      <section className="mobile-category-clean-section mobile-only">
        <div className="mobile-category-header">
          <div className="mobile-category-pretitle">SHOP BY</div>
          <h2 className="mobile-category-main-title">CATEGORY</h2>
          <div className="mobile-category-accent-bar" />
        </div>

        <div className="mobile-category-grid">
          {MOBILE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="mobile-category-cell"
              onClick={() => navigate(cat.path)}
            >
              <div className="mobile-category-cell-top">
                <span className="mobile-category-cell-title">{cat.title}</span>
              </div>
              <div className="mobile-category-cell-img-wrap">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="mobile-category-cell-img"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mobile-category-footer">
          <button
            className="mobile-category-shop-all-btn"
            onClick={() => navigate('/collection')}
          >
            SHOP ALL
          </button>
        </div>
      </section>

      {/* ─── 4b. SEASONAL DROP BANNERS (from Admin) ─────────────────────────── */}
      {activeDrops.map((drop) => (
        <section
          key={drop.id}
          style={{
            position: 'relative',
            minHeight: 280,
            borderRadius: 'var(--radius-lg, 16px)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            background: drop.img ? 'transparent' : 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)',
            margin: '0 var(--page-padding, 24px)',
          }}
          onClick={() => drop.link && navigate(drop.link)}
        >
          {drop.img && (
            <>
              <img src={drop.img} alt={drop.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 100%)' }} />
            </>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: '40px 48px', maxWidth: 560 }}>
            {drop.name && (
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand-accent, #c9a96e)', marginBottom: 10 }}>
                {drop.name}
              </div>
            )}
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
              {drop.title}
            </h2>
            {drop.subtitle && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', lineHeight: 1.6, maxWidth: 420 }}>
                {drop.subtitle}
              </p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); drop.link && navigate(drop.link); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              {drop.cta || 'SHOP NOW'}
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        </section>
      ))}

      {/* ─── 5. PRODUCT CATALOG & TABS ─────────────────────────────────────── */}
      <section className="content-container">
        <h2 className="new-arrivals-heading-title" style={{ margin: '28px 0 20px' }}>
          BESTSELLERS
        </h2>

        {/* Filter Category Tabs — minimal, no scroll */}
        <div className="catalog-filter-tabs">
          {CATALOG_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`catalog-filter-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-light)',
            margin: '20px 0'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--text-muted)' }}>inventory_2</span>
            <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', marginTop: 12 }}>Catalog is Empty</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 360, margin: '6px auto 16px' }}>
              No items in this category yet. Add fresh collections from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="product-grid-home">
            {filteredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button
              onClick={() => navigate('/collection')}
              className="btn-outline"
              style={{ padding: '0 36px', height: 46 }}
            >
              <span>Explore Entire Catalog ({products.length} Items)</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
