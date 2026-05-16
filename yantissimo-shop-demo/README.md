# yantissimo-shop-demo

Thin static wrapper around the live Yantissimo public catalog.

Unlike the other demos in this monorepo, the Shop is already publicly browsable in production at `yantissimo.com` with no login and no sensitive data exposed. Forking and stubbing the source would have meant maintaining a divergent copy of the real Shopify Storefront integration for no real safety win. Instead, this folder is a single `index.html` that iframes the real shop and adds a thin context banner.

Verified at bootstrap that `yantissimo.com` does not set `X-Frame-Options` or a restrictive `Content-Security-Policy frame-ancestors`, so the page can be embedded.

## Deploy

Static-only. No build step, no dependencies.

Vercel project:
- Root Directory: `yantissimo-shop-demo`
- Framework Preset: Other / Static
- Build Command: (none)
- Output Directory: `.` (or leave default)

## Maintenance

If Yantissimo later adds anti-framing headers (`X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`), the iframe will render blank and the fallback link kicks in. At that point either remove this folder or refactor it into a proper forked stub (see the pattern used in `yantissimo-demo/`).

To point at a different catalog view, edit the two URLs in `index.html` (banner link + iframe `src`).
