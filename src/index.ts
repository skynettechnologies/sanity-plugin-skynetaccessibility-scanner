import {definePlugin} from 'sanity'
import PluginIcon from './icon'
import pluginPage from './plugin'

interface skynetAccessibilityScannerPluginConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-skynetaccessibility-scanner'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */

import {AssetSource, Tool as SanityTool, } from 'sanity'

const plugin = {
  icon: PluginIcon,
  name: 'sanity-plugin-skynetaccessibility-scanner',
  title: 'SkynetAccessibility Scanner',
}

const tool = {
  ...plugin,
  component: pluginPage,
} satisfies SanityTool

export const SkynetAccessibilityScannerPlugin = definePlugin<skynetAccessibilityScannerPluginConfig | void>(options => ({
  name: 'sanity-plugin-skynetaccessibility-scanner',
  tools: prev => {
    return [...prev, tool]
  }
}))