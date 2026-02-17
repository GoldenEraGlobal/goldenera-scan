import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '@/components/header.js'
import { Footer } from '@/components/footer.js'
import { ThemeProvider } from '@/components/theme-provider'
import { getLocale } from '../paraglide/runtime.js'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { NotFoundCard } from '@/components/not-found-card'
import { PageSkeleton } from '@/components/page-skeleton'
import { QueryClient } from '@tanstack/react-query'
import { tokensQueryOptions } from '@/hooks/useTokens.js'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: import.meta.env.VITE_APP_NAME || 'GE Explorer',
      },
      {
        name: 'msapplication-TileColor',
        content: '#ffffff',
      },
      {
        name: 'msapplication-TileImage',
        content: '/ms-icon-144x144.png',
      },
      {
        name: 'theme-color',
        content: '#ffffff',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
      { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
      { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
      { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
      { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
      { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
      { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-icon-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundCard,
  pendingComponent: PageSkeleton,
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(
      tokensQueryOptions(),
    )
    return {
      tokens: data,
    }
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <NuqsAdapter>
          <ThemeProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen w-full">
                <Header />
                {children}
                <Footer />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Scripts />
      </body>
    </html >
  )
}
