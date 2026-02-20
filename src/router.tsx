import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { QueryClient } from '@tanstack/react-query'
import { NotFoundCard } from './components/not-found-card'
import { ErrorCard } from './components/error-card'
import { PageSkeleton } from './components/page-skeleton'

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient, APP_NAME: 'GoldenEra Scan' },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    notFoundMode: 'root',
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    defaultNotFoundComponent: NotFoundCard,
    defaultErrorComponent: ErrorCard,
    defaultPendingComponent: PageSkeleton,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
