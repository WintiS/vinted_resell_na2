import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>SupplierSaaS | Launch Your Supplier Store</title>
                <meta name="description" content="The ultimate 100% profit model. Sell verified Vinted supplier lists through your own branded storefront." />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="bg-background-dark text-white min-h-screen overflow-x-hidden">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white text-xl md:text-2xl">rocket_launch</span>
                                </div>
                                <span className="text-lg md:text-xl font-extrabold tracking-tight text-white">
                                    Supplier<span className="text-primary">SaaS</span>
                                </span>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#features">
                                    Features
                                </a>
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#how-it-works">
                                    How it Works
                                </a>
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#pricing">
                                    Pricing
                                </a>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="text-sm font-semibold text-white border border-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="text-sm font-semibold bg-gradient-primary text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all"
                                >
                                    Start Free Trial
                                </button>
                            </div>
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <span className="material-icons text-white">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-background-dark border-t border-slate-800">
                            <div className="px-4 py-4 space-y-3">
                                <a
                                    className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2"
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2"
                                    href="#how-it-works"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    How it Works
                                </a>
                                <a
                                    className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2"
                                    href="#pricing"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pricing
                                </a>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full text-sm font-semibold text-white border border-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="w-full text-sm font-semibold bg-gradient-primary text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all"
                                >
                                    Start Free Trial
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <header className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-32 lg:pb-40">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(59,130,246,0.15)_0%,transparent_100%)]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs md:text-sm font-bold mb-6 md:mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            Join 500+ successful store owners
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 md:mb-6">
                            Launch Your Own <br /> <span className="text-gradient">Supplier Store</span> in Minutes
                        </h1>
                        <p className="max-w-2xl mx-auto text-base md:text-xl text-slate-400 mb-8 md:mb-10 leading-relaxed px-4">
                            The ultimate 100% profit model. Sell verified Vinted supplier lists through your own branded storefront without writing a single line of code.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button
                                onClick={() => router.push('/signup')}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Start Your Store Now
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 bg-slate-800/50 backdrop-blur-sm text-white text-lg font-bold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <span className="material-icons">play_circle</span>
                                Watch Demo
                            </button>
                        </div>
                        <div className="mt-12 md:mt-20 relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-[3rem] -z-10"></div>
                            <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-2 backdrop-blur-sm">
                                <img
                                    className="rounded-xl w-full h-auto object-cover max-h-[600px] brightness-90 grayscale-[0.2]"
                                    alt="Modern SaaS dashboard showing sales analytics and supplier inventory"
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* How it Works */}
                <section className="py-24 bg-slate-900/50" id="how-it-works">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">How it Works</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">Three simple steps to transition from zero to a fully operational digital product empire.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="relative text-center group">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-primary group-hover:scale-110 transition-all duration-300 border border-slate-700">
                                    <span className="material-icons text-3xl text-primary group-hover:text-white">person_add_alt</span>
                                </div>
                                <div className="absolute top-0 right-1/2 translate-x-12 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">1</div>
                                <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
                                <p className="text-slate-400">Create your account and choose your custom store domain in less than 60 seconds.</p>
                            </div>
                            <div className="relative text-center group">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-primary group-hover:scale-110 transition-all duration-300 border border-slate-700">
                                    <span className="material-icons text-3xl text-primary group-hover:text-white">dashboard_customize</span>
                                </div>
                                <div className="absolute top-0 right-1/2 translate-x-12 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">2</div>
                                <h3 className="text-xl font-bold text-white mb-3">Customize Your Store</h3>
                                <p className="text-slate-400">Add your logo, set your pricing, and select which verified lists you want to offer.</p>
                            </div>
                            <div className="relative text-center group">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-primary group-hover:scale-110 transition-all duration-300 border border-slate-700">
                                    <span className="material-icons text-3xl text-primary group-hover:text-white">payments</span>
                                </div>
                                <div className="absolute top-0 right-1/2 translate-x-12 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">3</div>
                                <h3 className="text-xl font-bold text-white mb-3">Promote & Earn</h3>
                                <p className="text-slate-400">Share your store link on social media. Collect 100% of every sale directly to your stripe.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24" id="features">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <span className="text-primary font-bold text-sm uppercase tracking-widest">Built for Profit</span>
                                <h2 className="text-4xl font-extrabold text-white mt-4 mb-6 leading-tight">Features that scale with your ambition</h2>
                                <p className="text-slate-400 text-lg mb-8">We handle the technical heavy lifting so you can focus on marketing and growing your brand.</p>
                                <div className="space-y-6">
                                    <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <span className="material-icons text-primary">bolt</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Instant Store Setup</h4>
                                            <p className="text-slate-400">Zero coding required. Your store is live the moment you finish onboarding.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <span className="material-icons text-primary">verified_user</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Verified Suppliers</h4>
                                            <p className="text-slate-400">We provide pre-vetted supplier lists that ensure your customers are satisfied.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-colors">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <span className="material-icons text-primary">account_balance_wallet</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">100% Profit Retention</h4>
                                            <p className="text-slate-400">We don't take a cut of your sales. Pay a flat monthly fee, keep every cent you earn.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative overflow-hidden">
                                <div className="aspect-square bg-primary/5 rounded-[4rem] absolute -top-10 -right-10 w-full h-full -z-10 rotate-6 border border-primary/20 hidden md:block"></div>
                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
                                    <img
                                        className="w-full h-full object-cover brightness-75"
                                        alt="Digital marketing strategy and business growth chart visualization"
                                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-24 bg-slate-900/50" id="pricing">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h2>
                            <p className="text-slate-400">Pick the plan that fits your business stage. No hidden fees.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="p-8 rounded-2xl border border-slate-700 bg-slate-800/40 flex flex-col hover:border-slate-500 transition-all">
                                <h3 className="text-lg font-bold text-white mb-2">Monthly</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-white">$29</span>
                                    <span className="text-slate-400">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        Unique referral link
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        100% commission on sales
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        Real-time analytics
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        24/7 Support
                                    </li>
                                </ul>
                                <button
                                    onClick={() => router.push('/signup?plan=monthly')}
                                    className="w-full py-4 rounded-xl border-2 border-slate-600 text-white font-bold hover:bg-slate-700 transition-all"
                                >
                                    Get Started
                                </button>
                            </div>
                            <div className="p-8 rounded-2xl border-2 border-primary bg-slate-800 flex flex-col relative scale-105 shadow-2xl shadow-primary/10 z-10">
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Save 17%
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Yearly</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-white">$290</span>
                                    <span className="text-slate-400">/yr</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        Everything in Monthly
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        2 months free
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        Priority support
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        Premium features
                                    </li>
                                </ul>
                                <button
                                    onClick={() => router.push('/signup?plan=yearly')}
                                    className="w-full py-4 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                                >
                                    Go Pro
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Real Results from Real Users</h2>
                            <div className="flex justify-center gap-1 text-yellow-500">
                                <span className="material-icons">star</span>
                                <span className="material-icons">star</span>
                                <span className="material-icons">star</span>
                                <span className="material-icons">star</span>
                                <span className="material-icons">star</span>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "I made back my initial investment in the first 48 hours. The automation works flawlessly—I literally wake up to sales notifications.",
                                    name: "Marcus T.",
                                    role: "Store Owner"
                                },
                                {
                                    quote: "The supplier lists are high quality. My customers are happy and they keep coming back for more. Highly recommended for side hustlers!",
                                    name: "Sarah L.",
                                    role: "Top Earner"
                                },
                                {
                                    quote: "I've tried dropshipping and other models, but this is the simplest way to start making passive income. The setup takes no time at all.",
                                    name: "David K.",
                                    role: "Platinum User"
                                }
                            ].map((testimonial, i) => (
                                <div key={i} className="p-8 bg-slate-800/40 rounded-2xl border border-slate-700 shadow-sm relative">
                                    <span className="material-icons absolute top-8 right-8 text-slate-700 text-6xl">format_quote</span>
                                    <p className="text-slate-300 mb-8 relative z-10">{testimonial.quote}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                            {testimonial.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{testimonial.name}</p>
                                            <p className="text-xs text-primary font-semibold uppercase">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-primary rounded-[2rem] p-8 lg:p-20 relative overflow-hidden text-center text-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32"></div>
                            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 relative z-10">
                                Ready to build your <br /> supplier empire?
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
                                Join 500+ entrepreneurs who turned their passion into a 100% profit machine. No credit card required to start.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="bg-white text-primary px-12 py-5 rounded-xl font-extrabold text-lg shadow-2xl hover:bg-blue-50 transition-all"
                                >
                                    Launch Your Store
                                </button>
                                <button className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-xl font-extrabold text-lg hover:bg-white/10 transition-all">
                                    View Sample Store
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-background-dark border-t border-slate-800 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center">
                                    <span className="material-icons text-white text-sm">rocket_launch</span>
                                </div>
                                <span className="text-lg font-bold text-white">SupplierSaaS</span>
                            </div>
                            <div className="flex gap-8 text-sm font-semibold text-slate-500">
                                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                                <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                                <a className="hover:text-primary transition-colors" href="#">Contact</a>
                                <a className="hover:text-primary transition-colors" href="#">Affiliates</a>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-800/50 text-center text-slate-600 text-sm">
                            © 2024 SupplierSaaS Platform. All rights reserved. Built for creators.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
