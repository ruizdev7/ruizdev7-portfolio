/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mapeo de variables de Starlight a Tailwind
        primary: "var(--sl-color-primary)",
        secondary: "var(--sl-color-secondary)",
        neutral: {
          100: "var(--sl-color-neutral-100)",
          300: "var(--sl-color-neutral-300)",
          700: "var(--sl-color-neutral-700)",
          900: "var(--sl-color-neutral-900)",
        },
        success: "var(--sl-color-success)",
        warning: "var(--sl-color-warning)",
        danger: "var(--sl-color-danger)",
      },
    },
  },
  plugins: [],
};

{
  /**

Tema Claro
Propiedad	Color (Hex)	Uso recomendado
--sl-color-primary	#4f46e5	Botones, enlaces, acentos
--sl-color-secondary	#ec4899	Destacados, hover
--sl-color-neutral-100	#f8fafc	Fondo de página
--sl-color-neutral-300	#cbd5e1	Bordes, líneas divisorias
--sl-color-neutral-700	#334155	Texto principal
--sl-color-neutral-900	#0f172a	Títulos, encabezados
--sl-color-success	#10b981	Éxito, confirmaciones
--sl-color-warning	#f59e0b	Advertencias
--sl-color-danger	#ef4444	Errores, alertas críticas

Tema Oscuro
Propiedad	Color (Hex)	Uso recomendado
--sl-color-primary	#818cf8	Botones, acentos brillantes
--sl-color-secondary	#f472b6	Destacados en modo oscuro
--sl-color-neutral-100	#1e293b	Fondo oscuro
--sl-color-neutral-300	#475569	Bordes, elementos sutiles
--sl-color-neutral-700	#e2e8f0	Texto legible en oscuro
--sl-color-neutral-900	#f8fafc	Títulos en modo oscuro
--sl-color-success	#34d399	Éxito (más vibrante en oscuro)
--sl-color-warning	#fbbf24	Advertencias (contraste alto)
--sl-color-danger	#f87171	Errores en modo oscuro

  */
}
