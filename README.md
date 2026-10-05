# ToDo App
**Демо:** https://romakezik-todo.netlify.app/

Fullstack-приложение для управления задачами: React + TypeScript на фронте, 
Node.js + Express + JWT на бэкенде, PostgreSQL для данных.

## Архитектура
React (Netlify) → Express + JWT (Railway) → PostgreSQL

## Возможности
- регистрация и вход по JWT, приватные маршруты, удаление профиля
- CRUD задач: добавление, редактирование, удаление, отметка выполненных
- фильтры: все / активные / выполненные
- оптимистичные обновления с откатом при ошибке сервера

## Стек
- **Фронт:** React 19, TypeScript, Vite, React Router v7
- **Бэкенд:** Node.js, Express, JWT, bcrypt — [todo-server](https://github.com/romakezik/todo-server)
- **БД:** PostgreSQL
- **Тесты:** Vitest + Testing Library

## Деплой
- Фронт — Netlify
- Бэкенд — Railway

## Запуск
npm install
npm run dev

Backend: [todo-server](https://github.com/romakezik/todo-server) 
(прод-URL захардкожен в `src/lib/api.ts`).