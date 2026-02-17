import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'

export default defineConfig({
    root: '.',
    input: {
        path: './explorer-v1.json',
    },
    output: {
        path: './src/api/gen',
        clean: true,
    },
    plugins: [
        pluginOas(), // Required: Parse OpenAPI specification
        pluginTs(), // Generate TypeScript types
        pluginClient(), // Generate client
    ], // Add plugins here (see plugin documentation)
})