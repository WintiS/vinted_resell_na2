/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#3b82f6',
                'accent': '#a855f7',
                'background-dark': '#0f172a',
                'surface-dark': '#1e293b',
            },
            fontFamily: {
                'display': ['Manrope', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
