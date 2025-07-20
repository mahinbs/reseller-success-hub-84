
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
				}
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
				'typewriter': {
					from: { width: '0' },
					to: { width: '100%' }
				},
				'blink-caret': {
					'from, to': { 'border-color': 'transparent' },
					'50%': { 'border-color': 'hsl(var(--primary))' }
				},
				'float-random': {
					'0%, 100%': { 
						transform: 'translateX(0px) translateY(0px) rotate(0deg)' 
					},
					'33%': { 
						transform: 'translateX(30px) translateY(-30px) rotate(120deg)' 
					},
					'66%': { 
						transform: 'translateX(-20px) translateY(20px) rotate(240deg)' 
					}
				},
				'breathe': {
					'0%, 100%': { 
						transform: 'scale(1)' 
					},
					'50%': { 
						transform: 'scale(1.1)' 
					}
				},
				'gradient-shift': {
					'0%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
					'100%': { 'background-position': '0% 50%' }
				},
				'particle-drift': {
					'0%, 100%': { 
						transform: 'translateX(0px) translateY(0px)' 
					},
					'33%': { 
						transform: 'translateX(50px) translateY(-50px)' 
					},
					'66%': { 
						transform: 'translateX(-30px) translateY(30px)' 
					}
				},
				'bounce-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3) translateY(50px)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05) translateY(-10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0)'
					}
				},
				'fade-in-up': {
					from: {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					from: {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'pulse-scale': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.05)'
					}
				},
				'rotate-slow': {
					from: {
						transform: 'rotate(0deg)'
					},
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'wave-entrance': {
					'0%': {
						opacity: '0',
						transform: 'translateY(50px) scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'sidebar-expand': {
					from: {
						width: '5rem'
					},
					to: {
						width: '17.5rem'
					}
				},
				'sidebar-collapse': {
					from: {
						width: '17.5rem'
					},
					to: {
						width: '5rem'
					}
				},
				'slide-in-right': {
					from: {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					from: {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'fade-in-scale': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'stagger-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'icon-bounce': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.1)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 hsl(var(--primary) / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 20px 10px hsl(var(--primary) / 0.1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'typewriter': 'typewriter 3s steps(40, end), blink-caret 0.75s step-end infinite',
				'float-random': 'float-random 8s ease-in-out infinite',
				'breathe': 'breathe 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'particle-drift': 'particle-drift 20s ease-in-out infinite',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
				'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 20s linear infinite',
				'wave-entrance': 'wave-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'sidebar-expand': 'sidebar-expand 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'sidebar-collapse': 'sidebar-collapse 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-scale': 'fade-in-scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'stagger-in': 'stagger-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'icon-bounce': 'icon-bounce 0.3s ease-in-out',
				'pulse-glow': 'pulse-glow 2s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
