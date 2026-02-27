import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Contact() {
    const router = useRouter();
    const { t } = useLanguage();

    const contacts = [
        {
            id: 'email',
            label: 'Email',
            value: 'hello@vintedpoint.com',
            href: 'mailto:hello@vintedpoint.com',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            ),
            gradient: 'from-violet-500 to-purple-600',
            glow: 'rgba(139,92,246,0.25)',
            hoverBorder: '#7c3aed',
        },
        {
            id: 'instagram',
            label: 'Instagram',
            value: '@vintedpointcz',
            href: 'https://instagram.com/vintedpoint',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
                </svg>
            ),
            gradient: 'from-pink-500 via-rose-500 to-orange-400',
            glow: 'rgba(236,72,153,0.25)',
            hoverBorder: '#ec4899',
        },
        {
            id: 'tiktok',
            label: 'TikTok',
            value: '@vintedpointcz',
            href: 'https://tiktok.com/@vintedpoint',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
            ),
            gradient: 'from-cyan-400 to-sky-500',
            glow: 'rgba(34,211,238,0.25)',
            hoverBorder: '#22d3ee',
        },
    ];

    return (
        <>
            <Head>
                <title>{t('contact.pageTitle')}</title>
                <meta name="description" content="Get in touch with VintedPoint via email, Instagram, or TikTok." />
                <link rel="icon" href="/logo.ico" />
            </Head>

            <div style={{ minHeight: '100vh', background: '#0a0d14', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>

                {/* Google Font */}
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                    * { box-sizing: border-box; margin: 0; padding: 0; }

                    .contact-card {
                        background: rgba(255,255,255,0.035);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 20px;
                        padding: 28px 32px;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        text-decoration: none;
                        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
                        cursor: pointer;
                        width: 100%;
                        max-width: 480px;
                    }

                    .contact-card:hover {
                        transform: translateY(-4px) scale(1.01);
                        background: rgba(255,255,255,0.06);
                    }

                    .icon-wrap {
                        width: 56px;
                        height: 56px;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }

                    .icon-wrap svg {
                        width: 26px;
                        height: 26px;
                        color: #fff;
                    }

                    .card-label {
                        font-size: 13px;
                        font-weight: 600;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                        color: rgba(255,255,255,0.35);
                        margin-bottom: 4px;
                    }

                    .card-value {
                        font-size: 17px;
                        font-weight: 600;
                        color: #fff;
                    }

                    .arrow {
                        margin-left: auto;
                        flex-shrink: 0;
                        width: 34px;
                        height: 34px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.06);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: background 0.2s ease;
                        color: rgba(255,255,255,0.4);
                    }

                    .contact-card:hover .arrow {
                        background: rgba(255,255,255,0.12);
                        color: rgba(255,255,255,0.8);
                    }

                    .back-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: rgba(255,255,255,0.45);
                        font-size: 14px;
                        font-family: inherit;
                        font-weight: 500;
                        padding: 8px 0;
                        transition: color 0.2s;
                    }

                    .back-btn:hover { color: rgba(255,255,255,0.85); }

                    .dot-bg {
                        position: fixed;
                        inset: 0;
                        background-image: radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px);
                        background-size: 28px 28px;
                        pointer-events: none;
                        z-index: 0;
                    }

                    .glow-orb {
                        position: fixed;
                        border-radius: 50%;
                        filter: blur(100px);
                        pointer-events: none;
                        z-index: 0;
                    }
                `}</style>

                {/* Background accents */}
                <div className="dot-bg" />
                <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(109,40,217,0.12)', top: '-100px', right: '-80px' }} />
                <div className="glow-orb" style={{ width: 320, height: 320, background: 'rgba(236,72,153,0.08)', bottom: '60px', left: '-80px' }} />

                {/* Nav */}
                <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
                            <img src="/pointlogo.png" alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                                Vinted<span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Point</span>
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <LanguageToggle />
                            <button className="back-btn" onClick={() => router.push('/')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                                {t('contact.back')}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main */}
                <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                            borderRadius: 100, padding: '6px 16px', marginBottom: 20
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('contact.badge')}</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
                            {t('contact.title')}
                        </h1>
                        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
                            {t('contact.subtitle')}
                        </p>
                    </div>

                    {/* Contact cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 480, alignItems: 'center' }}>
                        {contacts.map((c) => (
                            <a
                                key={c.id}
                                id={`contact-${c.id}`}
                                href={c.href}
                                target={c.id !== 'email' ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="contact-card"
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = c.hoverBorder;
                                    e.currentTarget.style.boxShadow = `0 12px 40px ${c.glow}, 0 0 0 1px ${c.hoverBorder}20`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div
                                    className="icon-wrap"
                                    style={{ background: `linear-gradient(135deg, ${c.gradient.replace('from-', '').split(' ')[0]}, ${c.gradient.replace('to-', '').split(' ').pop()})` }}
                                >
                                    {c.icon}
                                </div>
                                <div>
                                    <div className="card-label">{c.label}</div>
                                    <div className="card-value">{c.value}</div>
                                </div>
                                <div className="arrow">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Footer note */}
                    <p style={{ marginTop: 48, fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                        {t('contact.responseNote')}
                    </p>
                </main>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                `}</style>
            </div>
        </>
    );
}
