# Montenegro FAQ

An AI-assisted multilingual information platform for visiting and living in Montenegro. Created by [BEMU](https://bemu.me).

**Website:** https://montenegrofaq.org · **Short NFC address:** https://montefaq.org/nfc

English and Turkish are the first release. Additional European languages, Russian, Ukrainian, Simplified/Traditional Chinese, Japanese and Korean are planned. Arabic and Hebrew are outside the requested scope. Only completed languages appear in the site selector.

## What is included

- Responsive editorial design inspired by Kotor Bay, with light/dark/system appearance.
- Thirteen bilingual guides, searchable locally and grouped by topic.
- Visible last-change and source-check dates immediately before article content.
- Breadcrumbs, matching-language links, table of contents and related guides.
- Canonical URLs, reciprocal `hreflang`, XML sitemap, JSON-LD, Open Graph and social preview images.
- Transparent AI attribution, source links, BEMU and public GitHub links.
- Optional consent-gated Google Analytics 4; no analytics is loaded without a configured ID and opt-in.
- Feedback, correction, feature and removal form with private Telegram delivery through Cloudflare Pages Functions.
- NFC language routing and short-domain redirects.
- GitHub Actions checks, weekly link/review-age audit and monthly Dependabot updates for Actions.

## Development

Node.js 24 recommended. No runtime or build dependencies.

```sh
npm run build
npm run check
npm test
npm run dev
```

The site is generated into `dist/` as HTML, CSS and small browser scripts. No database or client framework is required. The feedback API is the only server endpoint; `npm run dev` previews the static site only. Test the API in Cloudflare or with Pages' local Functions tooling.

## Content and dates

Edit `content/guides.mjs`; interface translations live in `content/locales.json`. A substantial content change requires an accurate `updated` date and an incremented revision. Record the matching version under each translated locale only after reviewing it. Source-check dates record consulted references, not independent human or official approval. Never advance them just because the site is rebuilt. The source audit flags broken/unavailable links and overdue checks; it does **not** verify facts or rewrite content.

Planning checklists and routes are editorial suggestions. Entry/residence information links to official sources. AI content can be wrong and should be independently reviewed, particularly for legal or other consequential topics.

## Cloudflare Pages Git integration

Connect only this repository to a new Pages project:

- Production branch: `main`
- Framework preset: None
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION=24`
- Preview deployments: feature branches in this repository
- Custom domains: `montenegrofaq.org`, `montefaq.org`, plus `www` aliases if desired

The `functions/` directory is at the repository root. `_routes.json` invokes Functions only for `/api/*`; content remains static. Configure Cloudflare zone Redirect Rules to send the short and `www` domains to the canonical domain, preserving the path and query string. Pages `_redirects` cannot match source domains. Attach required hostnames for TLS before testing redirects.

Set a branch rule requiring the `HTML, SEO, translations and feedback` check and PRs before merges. Cloudflare deploys `main` automatically after a merge; feature branches get preview URLs. The first bootstrap commit is pushed before enabling the rule.

Preview hostnames should not be indexed; Cloudflare Pages adds an `X-Robots-Tag: noindex` header to preview deployments. Production `pages.dev` can also be redirected to the custom domain using a Cloudflare redirect rule.

## Telegram delivery — secrets stay out of GitHub

In Pages → Settings → Variables and Secrets, set these **encrypted secrets** in the Production environment:

- `TELEGRAM_BOT_TOKEN`: your Telegram bot token.
- `TELEGRAM_CHAT_ID`: the destination chat; start the bot or add it to your intended chat first.

Create a Cloudflare KV namespace and bind it under **`FEEDBACK_LIMITS`** in Settings → Bindings. It stores salted hashes of request IPs and short-lived counters (120 seconds), not messages or emails. Limit: three attempts per IP per minute. KV is eventually consistent, so this is best-effort abuse control, not a strict global quota. The honeypot, same-origin validation and bounded message length provide additional checks. Production secrets need not be enabled on branch previews.

Redeploy after changing bindings/secrets. Until delivery and KV are configured, the API returns a clear failure and never pretends a message was sent. No message text or credentials are logged. Telegram messages are plain text, not Markdown/HTML, and no form contents are sent to analytics.

The optional reply email is delivered privately with the message. Telegram storage is controlled by the recipient; there is no automatic retention deletion yet. See the public privacy page. Credential entry and rotation happen directly in Cloudflare, never in source files, Actions YAML, browser JavaScript, issues or chat.

## Analytics and search

Set `gaId` in `site.config.json` to your `G-…` measurement ID (public identifier, not a secret) and redeploy. The Google tag loads only after analytics consent. Rejection blocks it; withdrawing consent reloads without the tag and clears accessible `_ga*` cookies. No advertising tags are configured. Provide `/sitemap.xml` to Search Console after verifying ownership. Search Console setup requires the owner's Google account.

## Automation

`checks.yml`: on PRs, pushes to main and manual runs. Checks HTML structure, local links/assets, JSON-LD, alternates, translation versions, dates and feedback behaviour.

`content-audit.yml`: Tuesdays at 07:19 UTC and manual runs. Reports source HTTP failures and sources due for review. GitHub notifications can report a failed workflow. Scheduled workflows can be delayed, and public-repository schedules are disabled after 60 days without activity. No content is silently published by the audit.

## Media and reuse

Photo: [olgakuligina, WordPress Photo Directory](https://wordpress.org/photos/photo/78769a5c8a/), [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The local WebP and social images are derived from it. Display crops do not alter the underlying attribution. No generated image is presented as a real photograph.

The source repository is public for transparency. No general reuse licence has been granted; BEMU branding and original content remain reserved unless separately stated. Third-party media retains its own licence.
