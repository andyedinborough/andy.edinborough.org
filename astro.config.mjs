// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.
import preact from '@astrojs/preact';
import icon from "astro-icon";

// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
  integrations: [preact(), icon()],
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
