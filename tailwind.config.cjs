/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
        './index.html',
        './src/**/*.{ts,tsx}',
        './modules/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg-app)',
                surface: 'var(--bg-surface)',
                'muted-bg': 'var(--bg-muted)',
                elevated: 'var(--surface-elevated)',
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                'primary-active': 'var(--primary-active)',
                'primary-soft': 'var(--primary-soft)',
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                border: 'var(--border-default)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
