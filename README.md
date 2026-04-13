This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

De Next-app staat in de **repository-root** (één `package.json` met `next`). Er staat een minimale **`vercel.json`** met `"framework": "nextjs"`.

1. Koppel de repo **Michelvanderput/hyrox**.
2. **Settings → General → Root Directory**: **leeg** of **`.`** (niet een oude submap).
3. **Settings → Build & Deployment → Framework Preset**: **Next.js** (niet “Other”).
4. **Zelfde scherm → Output Directory**: **leeg laten** (geen `out`, `dist`, `.next` of `hyrox-tracker/...`). Voor Next.js vult Vercel dat zelf in; een verkeerde map geeft vaak **404** na een geslaagde build ([Vercel uitleg](https://vercel.com/guides/why-is-my-deployed-project-giving-404)).

Productiebuild gebruikt **`next build --webpack`** (stabieler op Vercel dan de Turbopack-default bij sommige projecten).

Lokaal: `npm install` en `npm run dev` / `npm run build` in de repo-root.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
