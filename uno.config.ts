import { defineConfig, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from "unocss"
import { hex2rgba } from "@unocss/rule-utils"
import { sources } from "./shared/sources"

export default defineConfig({
  mergeSelectors: false,
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  rules: [
    [/^sprinkle-(.+)$/, ([_, d], { theme }) => {
      // @ts-expect-error >_<
      const hex: any = theme.colors?.[d]?.[400]
      if (hex) {
        return {
          "background-image": `radial-gradient(ellipse 80% 80% at 50% -30%,
         rgba(${hex2rgba(hex)?.join(", ")}, 0.3), rgba(255, 255, 255, 0));`,
        }
      }
    }],
    [
      "font-brand",
      {
        "font-family": `"Baloo 2", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace; `,
      },
    ],
  ],
  shortcuts: {
    "color-base": "color-[#1a1a2e] dark:color-[#e2e8f0]",
    "bg-base": "bg-[#f5f5f0] dark:bg-[#0f1117]",
    "bg-elevated": "bg-[#ecece5] dark:bg-[#151822]",
    "btn": "op60 hover:op100 transition-opacity-200",
    "btn-primary": "bg-[#dc1b21] hover:bg-[#b8151a] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all-200 active:scale-95",
    "btn-ghost": "op60 hover:op100 hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 transition-all-200",
    "nav-link": "px-5 py-1.5 rounded-lg text-sm font-medium transition-all-200 hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)]",
    "nav-link-active": "bg-[rgba(99,102,241,0.1)] dark:bg-[rgba(99,102,241,0.15)] text-[#6366f1] font-bold",
  },
  safelist: [
    ...["orange", ...new Set(Object.values(sources).map(k => k.color))].map(k =>
      `bg-${k} color-${k} border-${k} sprinkle-${k} shadow-${k}
       bg-${k}-500 color-${k}-500
       dark:bg-${k} dark:color-${k}`.trim().split(/\s+/)).flat(),
  ],
  extendTheme: (theme) => {
    // @ts-expect-error >_<
    // @ts-expect-error >_<
    theme.colors.primary = theme.colors.indigo
    return theme
  },
})
