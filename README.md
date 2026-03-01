<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6fae3fac-85d1-4330-b440-cef3de9e5630

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Padrão de rotas (App Router)

Para evitar acoplamento entre Server Components e componentes de UI interativos, seguimos este padrão:

1. `src/app/**/page.tsx` deve apenas:
   - consultar dados (server-side);
   - montar o objeto `db` com tipagem forte (`Database`);
   - renderizar um wrapper `*Route` em `src/components/routes/`.
2. `src/components/routes/*Route.tsx` deve:
   - começar com `'use client'`;
   - usar `useRouteToast()` para integração padronizada de feedback;
   - usar `useTheme()` quando a feature depender de tema;
   - encapsular imports de `src/components/features/*`.
3. `page.tsx` não deve importar `src/components/features/*` diretamente.
4. `page.tsx` não deve conter callbacks placeholder (ex.: `toast={() => {}}`, `toggleTheme={() => {}}`).

Esse padrão mantém separação clara entre camada de dados (server) e camada interativa (client).
