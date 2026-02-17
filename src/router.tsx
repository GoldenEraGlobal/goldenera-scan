import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { QueryClient } from '@tanstack/react-query'

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient, APP_NAME: 'GoldenEra Scan' },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
