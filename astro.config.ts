import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import expressiveCode from 'astro-expressive-code'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import tailwindcss from '@tailwindcss/vite'

const VITE_ALLOWED_HOSTS = ['merox.horu.dev', '.horu.dev'] as const

const ENV = (globalThis as any)?.process?.env as
  | Record<string, string | undefined>
  | undefined

const DEBUG_VITE_ALLOWED_HOSTS = ENV?.DEBUG_VITE_ALLOWED_HOSTS
const VITE_ALLOWED_HOSTS_ALL =
  ENV?.VITE_ALLOWED_HOSTS_ALL === '1' || ENV?.VITE_ALLOWED_HOSTS_ALL === 'true'

const VITE_ALLOWED_HOSTS_CONFIG: true | string[] = VITE_ALLOWED_HOSTS_ALL
  ? true
  : [...VITE_ALLOWED_HOSTS]

if (DEBUG_VITE_ALLOWED_HOSTS) {
  // Helpful when debugging remote deployments (k8s/ingress/proxy): confirms config is actually loaded.
  // eslint-disable-next-line no-console
  console.log('[astro.config] vite.allowedHosts =', VITE_ALLOWED_HOSTS_CONFIG)
}

export default defineConfig({
  site: 'https://merox.horu.dev', // Update with your domain
  // Static output - API routes are handled by Cloudflare Pages Functions in /functions folder
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme="${theme.name.split('-')[1]}"]`,
      defaultProps: {
        wrap: true,
        collapseStyle: 'collapsible-auto',
        overridesByLang: {
          'ansi,bat,bash,batch,cmd,console,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,zsh':
            {
              showLineNumbers: false,
            },
        },
      },
      styleOverrides: {
        codeFontSize: '0.75rem',
        borderColor: 'var(--border)',
        codeFontFamily: 'var(--font-mono)',
        codeBackground:
          'color-mix(in oklab, var(--muted) 25%, transparent)',
        frames: {
          editorActiveTabForeground: 'var(--muted-foreground)',
          editorActiveTabBackground:
            'color-mix(in oklab, var(--muted) 25%, transparent)',
          editorActiveTabIndicatorBottomColor: 'transparent',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorTabBorderRadius: '0',
          editorTabBarBackground: 'transparent',
          editorTabBarBorderBottomColor: 'transparent',
          frameBoxShadowCssValue: 'none',
          terminalBackground:
            'color-mix(in oklab, var(--muted) 25%, transparent)',
          terminalTitlebarBackground: 'transparent',
          terminalTitlebarBorderBottomColor: 'transparent',
          terminalTitlebarForeground: 'var(--muted-foreground)',
        },
        lineNumbers: {
          foreground: 'var(--muted-foreground)',
        },
        uiFontFamily: 'var(--font-sans)',
      },
    }),
    mdx(),
    react(),
    sitemap(),
    icon(),
  ],
  vite: {
    // Type assertion needed due to Vite plugin type incompatibility between Astro and @tailwindcss/vite
    // This is the recommended approach per Astro documentation for Vite plugins
    plugins: [tailwindcss() as any],
    server: {
      // Vite matches allowed hosts against the Host header. Using a leading dot allows the
      // apex domain and all subdomains (e.g. `.horu.dev` allows `merox.horu.dev`, `www.merox.horu.dev`, etc).
      allowedHosts: VITE_ALLOWED_HOSTS_CONFIG,
      host: true,
    },
    preview: {
      allowedHosts: VITE_ALLOWED_HOSTS_CONFIG,
      host: true,
    },
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noreferrer', 'noopener'],
        },
      ],
      rehypeHeadingIds,
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark',
          },
        },
      ],
    ],
    remarkPlugins: [remarkMath, remarkEmoji],
  },
})
