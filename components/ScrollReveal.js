'use client';

import React, { useEffect, useRef, useState } from 'react';

const THRESHOLD = 0.1;
const ROOT_MARGIN = '0px 0px -50px 0px';

export default function ScrollReveal({ children, className = '', direction = 'up', delay = 0, stagger = false, as = 'div' }) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true);
            },
            { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const Tag = as;
    const baseClass = `scroll-reveal scroll-reveal--${direction}`;
    const visibleClass = inView ? 'scroll-reveal--visible' : '';
    const delayStyle = delay ? { animationDelay: `${delay}ms` } : undefined;

    if (stagger) {
        const childArray = React.Children.toArray(children);
        return (
            <Tag ref={ref} className={`${baseClass} ${visibleClass} ${className}`.trim()}>
                {childArray.map((child, i) => (
                    <div key={child.key ?? i} className="scroll-reveal__stagger-child" style={{ transitionDelay: inView ? `${i * 80}ms` : '0ms' }}>
                        {child}
                    </div>
                ))}
            </Tag>
        );
    }

    return (
        <Tag ref={ref} className={`${baseClass} ${visibleClass} ${className}`.trim()} style={delayStyle}>
            {children}
        </Tag>
    );
}
