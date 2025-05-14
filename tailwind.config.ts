
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Neo-brutalist theme colors
				pet: {
					pink: '#FF405C',
					peach: '#FFA99F',
					yellow: '#FFDE59',
					purple: '#E5DEFF',
					blue: '#D3E4FD',
				},
				neobrutalism: {
					black: '#000000',
					white: '#FFFFFF',
					yellow: '#FFDE59',
					pink: '#FF405C',
					blue: '#4F7CFF',
					green: '#00CC99',
				},
				// Hand-drawn theme colors
				sketch: {
					paper: '#F9F6F0',
					ink: '#393535',
					primary: '#F47C7C',
					secondary: '#70AE98',
					accent: '#F9C784',
					light: '#EEF0F2',
					blue: '#A7C5EB',
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Fredoka', 'sans-serif'],
				sketch: ['Architects Daughter', 'cursive'],  // Hand-drawn font
				handwriting: ['Caveat', 'cursive'],          // Casual handwriting font
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				'draw-line': {
					'0%': { 'stroke-dashoffset': '1000' },
					'100%': { 'stroke-dashoffset': '0' },
				},
				'sketch-appear': {
					'0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				'wiggle': 'wiggle 2s ease-in-out infinite',
				'draw-line': 'draw-line 1.5s ease-in-out forwards',
				'sketch-appear': 'sketch-appear 0.6s ease-out forwards',
			},
			backgroundImage: {
				'gradient-pet': 'linear-gradient(225deg, #FFDE59 0%, #FFA99F 48%, #FF405C 100%)',
				'paper-texture': "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/><feColorMatrix type=\"matrix\" values=\"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.1 0\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
