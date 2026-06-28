# CineFlow — Запуск проекта

## 1. Supabase — создать проект

1. Зайти на https://supabase.com и создать новый проект
2. В SQL Editor выполнить содержимое файла `supabase-schema.sql`
3. Скопировать из Settings → API:
   - Project URL
   - anon/public key

## 2. Настроить переменные окружения

Открыть файл `.env.local` и заменить значения:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. Запустить локально

```bash
cd cineflow
npm run dev
```

Открыть http://localhost:3000

## 4. Деплой на Vercel

```bash
npx vercel
```

Добавить те же переменные окружения в Vercel Dashboard.
