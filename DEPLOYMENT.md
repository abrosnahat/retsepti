# 🚀 Руководство по деплою проекта Retsepti

Это руководство поможет вам развернуть приложение на production.

## 📋 Содержание

1. [Подготовка базы данных](#подготовка-базы-данных)
2. [Настройка переменных окружения](#настройка-переменных-окружения)
3. [Деплой на Vercel](#деплой-на-vercel)
4. [Деплой на Railway](#деплой-на-railway)
5. [Локальная разработка с PostgreSQL](#локальная-разработка-с-postgresql)
6. [Создание первого администратора](#создание-первого-администратора)

---

## 🗄️ Подготовка базы данных

### Вариант 1: Neon (Рекомендуется - Бесплатно)

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте Connection String (начинается с `postgresql://`)
4. Используйте его как `DATABASE_URL`

### Вариант 2: Supabase (Бесплатный план)

1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте Connection String (выберите "Session pooler")
5. Используйте его как `DATABASE_URL`

### Вариант 3: Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL из Marketplace
4. Скопируйте DATABASE_URL из переменных окружения

---

## 🔐 Настройка переменных окружения

### Локальная разработка (.env.local)

```bash
# База данных PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Или SQLite для разработки
# DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (для загрузки изображений)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Production переменные

**Обязательно установите:**

1. **DATABASE_URL** - строка подключения к PostgreSQL
2. **NEXTAUTH_SECRET** - сгенерируйте командой:
   ```bash
   openssl rand -base64 32
   ```
3. **NEXTAUTH_URL** - URL вашего production сайта (например, `https://retsepti.vercel.app`)
4. **Cloudinary переменные** - для загрузки изображений

---

## ☁️ Деплой на Vercel

### Шаг 1: Подготовка

```bash
# Убедитесь что все изменения закоммичены
git add .
git commit -m "Prepare for production deployment"
git push
```

### Шаг 2: Подключение к Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Import Project"
3. Выберите ваш GitHub репозиторий
4. Vercel автоматически определит Next.js проект

### Шаг 3: Настройка переменных окружения

В настройках Vercel добавьте все переменные:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Шаг 4: Настройка сборки

Vercel автоматически использует команды из `package.json`:

- Build Command: `npm run build` (уже включает `prisma generate`)
- Install Command: `npm install` (уже включает `postinstall` с `prisma generate`)

### Шаг 5: Деплой

1. Нажмите "Deploy"
2. Дождитесь завершения сборки
3. После успешного деплоя выполните миграции:

```bash
# Установите Vercel CLI
npm i -g vercel

# Залогиньтесь
vercel login

# Выполните миграцию в production базе
vercel env pull .env.production
npx prisma migrate deploy
```

**Или через Vercel Dashboard:**

- Settings → General → Enable "Automatically install dependencies"
- Settings → Environment Variables → Add all variables

---

## 🚂 Деплой на Railway

### Шаг 1: Создание проекта

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите ваш репозиторий

### Шаг 2: Добавление базы данных

1. В проекте нажмите "New" → "Database" → "PostgreSQL"
2. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 3: Настройка переменных

Добавьте в Variables:

```
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Шаг 4: Настройка деплоя

Railway автоматически:

- Определит Next.js проект
- Установит зависимости
- Выполнит `prisma generate` через `postinstall`
- Соберет проект командой `npm run build`

### Шаг 5: Миграция базы данных

После первого деплоя выполните:

```bash
# Подключитесь к Railway CLI
npm i -g @railway/cli
railway login

# Выполните миграцию
railway run npx prisma migrate deploy
```

---

## 💻 Локальная разработка с PostgreSQL

### Установка PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@17
brew services start postgresql@17
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Скачайте с [postgresql.org](https://www.postgresql.org/download/windows/)

### Создание локальной базы данных

```bash
# Создайте базу данных (используйте полный путь если createdb не найден)
/opt/homebrew/opt/postgresql@17/bin/createdb retsepti

# Или добавьте PostgreSQL в PATH (для постоянного использования)
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
createdb retsepti

# Или через psql
psql postgres
CREATE DATABASE retsepti;
\q
```

### Настройка .env.local

```bash
# Важно: укажите ваше имя пользователя macOS вместо "username"
DATABASE_URL="postgresql://username@localhost:5432/retsepti?schema=public"
```

### Выполнение миграций

```bash
# Создайте начальную миграцию
npm run db:migrate

# Или используйте db push для разработки
npm run db:push
```

---

## 👤 Создание первого администратора

### Вариант 1: Через скрипт (Рекомендуется)

```bash
npm run create-admin
```

Следуйте инструкциям на экране.

### Вариант 2: Через Prisma Studio

```bash
npm run db:studio
```

1. Откройте таблицу `User`
2. Создайте нового пользователя:
   - email: admin@example.com
   - password: (хешированный пароль - используйте bcrypt)
   - role: "admin"

### Вариант 3: Напрямую через SQL

```sql
-- Подключитесь к базе данных
psql $DATABASE_URL

-- Вставьте админа (пароль "admin123" - НЕ ИСПОЛЬЗУЙТЕ В PRODUCTION!)
INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2a$10$K5Q9YH1KQY8Q9ZH1KQY8Q9ZH1KQY8Q9ZH1KQY8Q9ZH1KQY8Q9ZH1K',
  'admin',
  NOW(),
  NOW()
);
```

⚠️ **Важно:** Сразу после входа смените пароль!

---

## ✅ Чеклист перед деплоем

- [ ] База данных PostgreSQL создана и доступна
- [ ] Все переменные окружения настроены
- [ ] `NEXTAUTH_SECRET` сгенерирован и уникален
- [ ] `NEXTAUTH_URL` указывает на production домен
- [ ] Cloudinary настроен для загрузки изображений
- [ ] Все изменения закоммичены в Git
- [ ] Миграции базы данных выполнены
- [ ] Создан первый администратор
- [ ] Протестирована авторизация
- [ ] Протестирована загрузка изображений

---

## 🔧 Полезные команды

```bash
# Разработка
npm run dev                  # Запуск dev сервера
npm run db:studio            # Открыть Prisma Studio
npm run db:push              # Синхронизация схемы (без миграций)

# Production
npm run build                # Сборка проекта
npm start                    # Запуск production сервера
npm run db:migrate           # Создать миграцию
npx prisma migrate deploy    # Применить миграции в production

# Администрирование
npm run create-admin         # Создать администратора
npx prisma studio            # Открыть базу данных в браузере
```

---

## 🐛 Решение проблем

### Ошибка подключения к базе данных

**Проблема:** `Error: Can't reach database server`

**Решение:**

1. Проверьте правильность `DATABASE_URL`
2. Убедитесь что база данных запущена
3. Проверьте firewall правила
4. Для облачных баз: проверьте IP whitelist

### Ошибка Prisma Client

**Проблема:** `@prisma/client did not initialize yet`

**Решение:**

```bash
npx prisma generate
npm run build
```

### NextAuth ошибки

**Проблема:** `[next-auth][error][CALLBACK_CREDENTIALS_HANDLER_ERROR]`

**Решение:**

1. Проверьте что `NEXTAUTH_SECRET` установлен
2. Проверьте что `NEXTAUTH_URL` правильный
3. Убедитесь что пользователь существует в базе

### Cloudinary ошибки

**Проблема:** Изображения не загружаются

**Решение:**

1. Проверьте все переменные Cloudinary
2. Убедитесь что upload preset настроен как "unsigned"
3. Проверьте Network tab в DevTools для деталей ошибки

---

## 📚 Дополнительные ресурсы

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [NextAuth.js Documentation](https://next-auth.js.org)

---

## 🎉 Готово!

Ваш сайт с рецептами теперь готов к production!

Если возникнут вопросы, обратитесь к документации платформ или создайте issue в репозитории.

**Приятного использования! 🍳**
