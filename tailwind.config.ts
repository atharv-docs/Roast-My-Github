import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        github: {
          bg: "#0d1117",
          "bg-secondary": "#161b22",
          "bg-tertiary": "#21262d",
          border: "#30363d",
          "text-primary": "#e6edf3",
          "text-secondary": "#8b949e",
          "text-muted": "#6e7681",
          green: "#238636",
          blue: "#58a6ff",
          red: "#f85149",
          orange: "#d29922",
          purple: "#a371f7",
          pink: "#db61a2",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Space Grotesk", "system-ui"],
        body: ["IBM Plex Sans", "system-ui"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "typing": "typing 3.5s steps(40, end)",
        "blink": "blink-caret 0.75s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blink-caret": {
          "from, to": { borderColor: "transparent" },
          "50%": { borderColor: "#58a6ff" },
        },
      },
    },
  },
  plugins: [],
};

export default config;