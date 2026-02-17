import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import preserveDirectives from 'rollup-preserve-directives'


const config = defineConfig({
  plugins: [paraglideVitePlugin({
    project: './project.inlang',
    outdir: './src/paraglide',
    strategy: ['cookie', 'preferredLanguage', 'baseLocale']
  }),
  preserveDirectives(),
  devtools() as any,
  nitro(),
  viteTsConfigPaths({
    projects: ['./tsconfig.json'],
  }),
  tailwindcss() as any,
  tanstackStart(),
  viteReact(),
  ],
})

export default config
