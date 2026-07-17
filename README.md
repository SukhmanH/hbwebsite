# H.B. Bro's Vineyards

Family-owned and operated vineyards across the South Okanagan — Naramata to Oliver, BC.

Static marketing site built with **Astro + Tailwind CSS v4**.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Deploy — Cloudflare Pages

The site is fully static; no adapter or functions needed.

1. Push this repo to GitHub/GitLab.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy.

## Swapping in real photography

Every image slot on the site is a `<PhotoPlaceholder>` component
(`src/components/PhotoPlaceholder.astro`) with a caption describing the shot
that belongs there. To use a real photo, replace the component with a standard
`<img>`/`<Picture>` pointing at a file in `public/images/` — the captions
double as a shot list for the photographer.

## Contact form

The form on `/contact` is wired as a `mailto:` handoff (zero backend, works
on a static host). To capture submissions server-side later, point the form
at a Cloudflare Pages Function or a service like Formspree — the form markup
in `src/pages/contact.astro` is standard HTML and ready for either.
