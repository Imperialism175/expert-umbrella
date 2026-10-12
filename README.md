# Калькулятор гравитационного замедления времени

Веб-приложение, которое считает, сколько времени пройдёт у чёрной дыры, пока на Земле проходит заданный интервал, — по метрике Шварцшильда.

Полный план разработки, формулы и roadmap: [PROJECT_PLAN.md](PROJECT_PLAN.md).
Визуальная концепция и план её реализации: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Стек

Vite · React 19 · TypeScript · Tailwind CSS v4 · Three.js + React Three Fiber · GSAP ScrollTrigger · Motion · zustand · Vitest + Testing Library · oxlint · Prettier

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

## Деплой на GitHub Pages

Сайт публикуется автоматически: при каждом пуше в `main` workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) запускает линтер и тесты, собирает проект и выкладывает `dist/` на GitHub Pages.

Один раз нужно включить Pages в репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Сайт лежит в подпапке (`/имя-репозитория/`), поэтому workflow передаёт сборке базовый путь через переменную `BASE_PATH`. Проверить такую сборку локально:

```powershell
$env:BASE_PATH = '/expert-umbrella/'; npm run build; npm run preview
```

В Git Bash на Windows так делать не стоит: он переписывает переменные, похожие на пути, и сборка получит неверный адрес.

## Структура

```
src/
├── physics/      # расчётное ядро: чистый TypeScript, без React
├── format/       # форматирование длительностей и чисел
├── state/        # редьюсер калькулятора, состояние в URL
├── scroll/       # дорожка скролла и вехи спуска
├── components/   # hud/, inputs/, results/, scene/
├── hooks/
├── i18n/         # строки интерфейса
└── test/         # настройка тестового окружения
```

## Статус

Этапы 1–3 плана выполнены. Из дизайн-системы готовы D2 (3D-сцена), D3 (спуск по скроллу) и основная часть D1 (HUD, шрифты, токены). Готовы и D4 (звёздная пыль, свечение, уровни качества), и D5 (анимации интерфейса, доступность). Осталось из исходного плана: блок «Как это считается», ссылка на расчёт, финальное тестирование и деплой.
