# Калькулятор гравитационного замедления времени

Веб-приложение, которое считает, сколько времени пройдёт у чёрной дыры, пока на Земле проходит заданный интервал, — по метрике Шварцшильда.

Полный план разработки, формулы и roadmap: [PROJECT_PLAN.md](PROJECT_PLAN.md).

## Стек

Vite · React 19 · TypeScript · Tailwind CSS v4 · Vitest + Testing Library · oxlint · Prettier

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run build` | проверка типов и production-сборка в `dist/` |
| `npm run preview` | локальный просмотр сборки |
| `npm run test` | тесты (однократно) |
| `npm run test:watch` | тесты в режиме наблюдения |
| `npm run coverage` | тесты с отчётом о покрытии |
| `npm run lint` | линтер |
| `npm run typecheck` | проверка типов |
| `npm run format` | форматирование Prettier |

## Структура

```
src/
├── physics/      # расчётное ядро: чистый TypeScript, без React
├── format/       # форматирование длительностей и чисел
├── state/        # редьюсер калькулятора, состояние в URL
├── components/   # inputs/, results/, scene/, layout/
├── hooks/
├── i18n/         # строки интерфейса
└── test/         # настройка тестового окружения
```

## Статус

Этапы 1 (инициализация) и 2 (математическое ядро) выполнены. Далее — Этап 3: базовый UI.
