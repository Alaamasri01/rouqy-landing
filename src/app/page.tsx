'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useLang } from '@/lib/lang-context';
import LangSwitcher from '@/components/lang-switcher';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// Logo SVG path data (from client's inline SVG)
const LOGO_PATH_D = "M345.55,167.19c0,6.3-2.72,11.08-8.16,14.35-2.81,1.53-5.64,2.28-8.47,2.28-2.19,0-4.24-.42-6.21-1.3-4.78-2.17-7.94-5.86-9.46-11.1-.44-1.5-1.53-2.28-3.27-2.28-1.08,0-1.95.55-2.61,1.64-3.03,5.66-4.55,11.65-4.55,17.95,0,2.61.2,5.22.64,7.83,1.53,8.93,7.19,16.43,16.98,22.53,3.47,1.53,6.04,3.91,7.67,7.16,1.61,3.27,2.43,6.77,2.43,10.46,0,12.85-2.17,25.56-6.52,38.18-8.91,27.2-24.59,46.9-47.01,59.08-11.3,6.08-24.25,9.24-38.82,9.46h-64.41v-162.48c0-79.26-64.23-143.49-143.47-143.49H10.03v113.01H1.5V1.5h208.23v133.7c0,12.67-5.04,24.83-14,33.78l-12.51,12.54,26.51,26.51v94.25c0,3.2.47,6.3,1.33,9.22,2.12,7.15,6.22,11.73,8.15,13.66,1.79,1.79,6.71,6.58,14.55,8.39,7.69,1.78,14.33-.19,19.56-1.75.75-.22,2.97-.9,5.75-2.09,13.27-5.66,22.84-15.23,28.72-28.72,2.83-6.74,4.22-14.04,4.22-21.87v-76.06c0-11.3,2.94-21.38,8.82-30.18,5.88-8.82,12.51-15.39,19.9-19.74,2.83-1.53,5.66-2.3,8.49-2.3,6.1,0,10.77,2.74,14.04,8.18,1.53,2.61,2.28,5.33,2.28,8.16Z";

export default function Home() {
  // Active language content + direction. Everything textual now comes from `t`.
  const { t, dir } = useLang();

  // Build projects array from the active locale's data.
  const projects = t.projects.items.map((item) => ({
    bg: `url(${item.image}) center/cover`,
    title: item.title,
  }));
  const SCROLL_COUNT = t.projects.scrollCount;

  const [introFading, setIntroFading] = useState(false);
  const [introRemoved, setIntroRemoved] = useState(false);
  const [heroShow, setHeroShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideWhatsapp, setHideWhatsapp] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);
  // Contact form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSending, setFormSending] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formErrorMsg, setFormErrorMsg] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Lock body scroll when gallery/lightbox is open
  useEffect(() => {
    if (galleryOpen || selectedImage !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [galleryOpen, selectedImage]);
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setHideWhatsapp(entry.isIntersecting);
    },
    {
      threshold: 0.1,
    }
  );

  if (footerRef.current) {
    observer.observe(footerRef.current);
  }

  return () => observer.disconnect();
}, []);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const drawPathRef = useRef<SVGPathElement>(null);
  const fillPathRef = useRef<SVGPathElement>(null);
  const aboutContentRef = useRef<HTMLDivElement>(null);
  const aboutLogoSvgRef = useRef<SVGSVGElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);
  const contactInnerRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  // ====== INTRO ANIMATION ======
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIntroFading(true);
      setHeroShow(true);

      const removeTimer = setTimeout(() => {
        setIntroRemoved(true);
      }, 800);

      return () => clearTimeout(removeTimer);
    }, 1200);

    return () => clearTimeout(fadeTimer);
  }, []);

  // ====== HEADER SCROLL DETECTION ======
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ====== GSAP ANIMATIONS ======
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDesktop = window.innerWidth > 768;

    const ctx = gsap.context(() => {

      // ---- About section: logo draw + scale + content reveal ----
      if (drawPathRef.current) {
        const length = drawPathRef.current.getTotalLength();

        gsap.set(fillPathRef.current, { opacity: 0 });

        gsap.set(drawPathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        if (isDesktop) {
          gsap.set(aboutContentRef.current, {
            x: -120,
            opacity: 0,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: 'top top',
              end: '+=4000',
              scrub: true,
              pin: true,
            },
          });

          tl.to(drawPathRef.current, {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'none',
          })
            .to(fillPathRef.current, {
              opacity: 1,
              duration: 1,
            })
            .to(drawPathRef.current, {
              opacity: 0,
              duration: 0.5,
            })
            .to(aboutLogoSvgRef.current, {
              scale: 7,
              x: () => window.innerWidth * 0.28,
              duration: 3,
              transformOrigin: 'center center',
            })
            .to(
              aboutContentRef.current,
              {
                opacity: 1,
                x: 0,
                duration: 1.5,
              },
              '-=1.5'
            );
        } else {
          gsap.set(aboutContentRef.current, {
            y: 60,
            opacity: 0,
          });

          const mobileTl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: 'top top',
              end: '+=3000',
              scrub: true,
              pin: true,
            },
          });

          mobileTl.to(drawPathRef.current, {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'none',
          })
            .to(fillPathRef.current, {
              opacity: 1,
              duration: 0.8,
            })
            .to(drawPathRef.current, {
              opacity: 0,
              duration: 0.4,
            })
            .to(aboutLogoSvgRef.current, {
              scale: 1.5,
              duration: 1,
              transformOrigin: 'center center',
            })
            .to(aboutLogoSvgRef.current, {
              scale: 0.6,
              y: () => -(window.innerHeight * 0.28),
              duration: 2,
              transformOrigin: 'center center',
              ease: 'power2.inOut',
            })
            .to(
              aboutContentRef.current,
              {
                opacity: 1,
                y: 0,
                duration: 1.2,
              },
              '-=1'
            );
        }
      }

      // ---- Gallery horizontal scroll ----
      // In RTL the track is anchored to the right, so it must travel in the
      // opposite (positive X) direction. `scrollAmount` stays positive; only
      // the sign of the translate flips.
      if (galleryTrackRef.current) {
        const rtl = dir === 'rtl';
        gsap.to(galleryTrackRef.current, {
          x: () => {
            const amount = galleryTrackRef.current!.scrollWidth - window.innerWidth;
            return rtl ? amount : -amount;
          },
          ease: 'none',
          scrollTrigger: {
            trigger: projectsSectionRef.current,
            start: 'top top',
            end: () => '+=' + (galleryTrackRef.current!.scrollWidth - window.innerWidth),
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // ---- Contact section reveal ----
      if (contactInnerRef.current) {
        const children = contactInnerRef.current.children;
        gsap.set(children, { y: 40, opacity: 0 });

        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactSectionRef.current,
            start: 'top 70%',
          },
        });
      }

      // ---- Smooth scroll for nav links ----
      document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', handleNavClick);
      });

    }); // end gsap.context

    gsapContextRef.current = ctx;

    // New language = different text widths and gallery track size, so let
    // ScrollTrigger recompute all pinned/scrubbed positions once laid out.
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
      document.querySelectorAll('.nav-links a').forEach((link) => {
        link.removeEventListener('click', handleNavClick);
      });
    };
    // `dir` re-runs the animation when language flips. `handleNavClick` is a
    // stable useCallback defined below; intentionally omitted to avoid a
    // temporal-dead-zone reference during module evaluation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir]);

  // ====== CONTACT FORM SUBMIT ======
  const handleContactSubmit = useCallback(async () => {
    setFormStatus('idle');
    setFormErrorMsg('');

    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setFormStatus('error');
      setFormErrorMsg(t.contact.errorAllFields);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setFormStatus('error');
      setFormErrorMsg(t.contact.errorEmail);
      return;
    }

    setFormSending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          message: formMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormStatus('error');
        setFormErrorMsg(data.error || t.contact.errorGeneric);
        return;
      }

      setFormStatus('success');
      setFormName('');
      setFormEmail('');
      setFormMessage('');

      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
    } catch {
      setFormStatus('error');
      setFormErrorMsg(t.contact.errorNetwork);
    } finally {
      setFormSending(false);
    }
  }, [formName, formEmail, formMessage, t]);

  // Nav click handler
  const handleNavClick = useCallback((e: Event) => {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = target.getAttribute('href')!;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const targetY = targetEl.getBoundingClientRect().top + window.scrollY;
        const distance = Math.abs(targetY - window.scrollY);
        const duration = Math.min(1.6, 0.5 + distance / 6000);

        gsap.to(window, {
          duration: duration,
          scrollTo: { y: targetId, offsetY: 80 },
          ease: 'power2.inOut',
        });
      }
    }
  }, []);

  return (
    <>
      {/* ====== INTRO ====== */}
      {!introRemoved && (
        <div
          id="intro"
          style={{
            opacity: introFading ? 0 : 1,
            transition: 'opacity 0.8s ease',
          }}
        >
          <img src="/logo.svg" className="intro-logo" alt={t.brand.name} />
        </div>
      )}

      {/* ====== HEADER ====== */}
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-links">
          {t.nav.links.map((link, i) => (
            <a key={i} href={link.href}>{link.label}</a>
          ))}
          <LangSwitcher />
        </div>
        <img src="/logo.svg" alt={t.brand.name} className="header-logo" />
      </header>

      {/* ====== HERO ====== */}
      <section className="hero">
        {dir === 'rtl' ? (
          /* Arabic: combined wordmark + tagline in one SVG (DG Trika) */
          <img
            src="/hero-ar.svg"
            alt={t.brand.name}
            className={`hero-logo hero-combined-ar${heroShow ? ' show' : ''}`}
          />
        ) : (
          <>
            <img
              src="/text.svg"
              alt={t.brand.name}
              className={`hero-logo${heroShow ? ' show' : ''}`}
            />
            <p
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "15px",
                letterSpacing: "8px",
                fontSize: "18px"
              }}
            >
              {t.brand.tagline}
            </p>
          </>
        )}
        <div className="scroll-line" />
      {dir === 'rtl' ? (
          <>
            <div className="side-text side-text-left side-text-svg-wrap">
              <img src="/sidetext-left-ar.svg" alt={t.sideText.left} className="side-text-svg" />
            </div>
            <div className="side-text side-text-right side-text-svg-wrap">
              <img src="/sidetext-right-ar.svg" alt="" className="side-text-svg" />
            </div>
          </>
        ) : (
          <>
            <div className="side-text side-text-left">
              <span>{t.sideText.left}</span>
            </div>
            <div className="side-text side-text-right">
              {t.sideText.right.map((text, i) => (
                <span key={i}>
                  {i > 0 && <span className="side-text-line" />}
                  <span>{text}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ====== ABOUT ====== */}
      <section className="about-section" id="about" ref={aboutSectionRef}>
        <div className="about-stage">
          <div className="about-content" ref={aboutContentRef}>
            <span className="about-label">{t.about.label}</span>
            <div className="about-line" />
            <h2>
              <span className="bold">{t.about.headingBold}</span>
              <br />
              <span className="light">{t.about.headingLight}</span>
            </h2>
            <p>{t.about.description}</p>
          </div>
          <div className="about-logo">
            <svg
              ref={aboutLogoSvgRef}
              id="Layer_1"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 347.05 344.93"
            >
              <path
                ref={fillPathRef}
                id="fill-logo"
                d={LOGO_PATH_D}
                fill="#fff"
              />
              <path
                ref={drawPathRef}
                id="draw-logo"
                d={LOGO_PATH_D}
                fill="none"
                stroke="#fff"
                strokeMiterlimit="10"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ====== PROJECTS ====== */}
      <section className="projects-section" id="projects" ref={projectsSectionRef}>
        <div className="gallery-wrap">
          <div className="gallery-track" ref={galleryTrackRef}>
            <div className="gallery-intro">
              <span className="gallery-label">{t.projects.sectionLabel}</span>
              <h2 className="gallery-heading">
                <span className="bold">{t.projects.headingBold}</span>{' '}
                <span className="light">{t.projects.headingLight}</span>
              </h2>
            </div>
            {projects.slice(0, SCROLL_COUNT).map((project, i) => (
              <div
                key={i}
                className="gallery-img gallery-img-clickable"
                style={{ background: project.bg }}
                onClick={() => setGalleryOpen(true)}
              >
                <span className="gallery-img-title">{project.title}</span>
                <span className="gallery-img-view">{t.projects.viewPortfolio}</span>
              </div>
            ))}
            <div className="gallery-cta-card" onClick={() => setGalleryOpen(true)}>
              <span className="gallery-cta-label">{t.projects.ctaLabel}</span>
              <span className="gallery-cta-text">{t.projects.ctaText}</span>
              <span className="gallery-cta-arrow">{dir === 'rtl' ? '←' : '→'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FULL GALLERY OVERLAY ====== */}
      {galleryOpen && (
        <div className="gallery-overlay" onClick={() => setGalleryOpen(false)}>
          <div className="gallery-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-overlay-header">
              <h2>
                <span className="bold">{t.projects.headingBold}</span> <span className="light">{t.projects.headingLight}</span>
              </h2>
              <button className="gallery-close-btn" onClick={() => setGalleryOpen(false)}>✕</button>
            </div>
            <div className="gallery-grid">
              {projects.map((project, i) => (
                <div
                  key={i}
                  className="gallery-grid-item"
                  style={{ background: project.bg }}
                  onClick={() => setSelectedImage(i)}
                >
                  <span className="gallery-grid-title">{project.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====== IMAGE LIGHTBOX ====== */}
      {selectedImage !== null && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <button
              className="lightbox-prev"
              onClick={() => setSelectedImage(selectedImage === 0 ? projects.length - 1 : selectedImage - 1)}
            >
              ‹
            </button>
            <div
              className="lightbox-img"
              style={{ background: projects[selectedImage].bg }}
            />
            <button
              className="lightbox-next"
              onClick={() => setSelectedImage(selectedImage === projects.length - 1 ? 0 : selectedImage + 1)}
            >
              ›
            </button>
            <div className="lightbox-info">
              <span className="lightbox-title">{projects[selectedImage].title}</span>
              <span className="lightbox-counter">{selectedImage + 1} / {projects.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ====== CONTACT ====== */}
      <section className="contact-section" id="contact" ref={contactSectionRef}>
        <div className="contact-inner" ref={contactInnerRef}>
          <span className="contact-label">{t.contact.label}</span>
          <h2 className="contact-title">
            <span className="light">{t.contact.headingLight}</span>
            <br />
            <span className="bold">{t.contact.headingBold}</span>
          </h2>
          <div className="contact-grid">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label htmlFor="name">{t.contact.nameLabel}</label>
                <input
                  type="text"
                  id="name"
                  placeholder={t.contact.namePlaceholder}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={formStatus === 'error' && !formName.trim() ? 'field-error' : ''}
                />
              </div>
              <div className="field">
                <label htmlFor="email">{t.contact.emailLabel}</label>
                <input
                  type="email"
                  id="email"
                  placeholder={t.contact.emailPlaceholder}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={formStatus === 'error' && !formEmail.trim() ? 'field-error' : ''}
                />
              </div>
              <div className="field">
                <label htmlFor="message">{t.contact.messageLabel}</label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder={t.contact.messagePlaceholder}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className={formStatus === 'error' && !formMessage.trim() ? 'field-error' : ''}
                />
              </div>
              <button
                type="button"
                className={`contact-btn${formSending ? ' sending' : ''}${formStatus === 'success' ? ' sent' : ''}`}
                onClick={handleContactSubmit}
                disabled={formSending}
              >
                {formSending ? t.contact.sendingLabel : formStatus === 'success' ? t.contact.sentLabel : t.contact.sendLabel}
              </button>
              {formStatus === 'error' && formErrorMsg && (
                <span className="form-error-msg">{formErrorMsg}</span>
              )}
              {formStatus === 'success' && (
                <span className="form-success-msg">{t.contact.successMsg}</span>
              )}
            </form>
            <div className="contact-details">
              <div className="detail">
                <span className="detail-label">{t.contact.emailDetailLabel}</span>
                <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
              </div>
              <div className="detail">
                <span className="detail-label">{t.contact.phoneDetailLabel}</span>
                <a href={`tel:${t.contact.phone}`} dir="ltr">{t.contact.phoneDisplay}</a>
              </div>
              <div className="detail">
                <span className="detail-label">{t.contact.studioDetailLabel}</span>
                <p>{t.contact.studio}</p>
              </div>
              <div className="detail">
                <span className="detail-label">{t.contact.followLabel}</span>
                <div className="socials">
                  {Object.entries(t.contact.socials).map(([name, url]) => (
                    <a key={name} href={url}>{name}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
<footer ref={footerRef} className="footer">
  <div className="footer-left">
    <h3>{t.brand.name}</h3>
    <p>{t.footer.services}</p>
  </div>

  <div className="footer-right">
    <p>{t.footer.rights}</p>

    <p className="footer-credit">
      {t.footer.credit}
    </p>
  </div>
</footer>

      {/* ====== WHATSAPP FLOATING BUTTON ====== */}
      <a
        href={`https://wa.me/${t.whatsapp.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`whatsapp-float ${hideWhatsapp ? 'hidden-wa' : ''}`}
        aria-label="WhatsApp"
      >
        <span className="whatsapp-float-ring" />
        <svg className="whatsapp-float-rotating-text" viewBox="0 0 200 200">
          <defs>
            <path id="textCircle" d="M 100, 100 m -72, 0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
          </defs>
          <text fill="rgba(255,255,255,0.7)" fontSize="11.5" letterSpacing="5" fontWeight="300">
            <textPath href="#textCircle">{t.whatsapp.rotatingText}</textPath>
          </text>
        </svg>
        <span className="whatsapp-float-icon">
          <img src="/logo.svg" alt={t.brand.name} />
        </span>
      </a>
    </>
  );
}
