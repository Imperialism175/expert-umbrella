import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { ru } from '@/i18n/ru'

describe('App', () => {
  it('показывает заголовок и каркас основных блоков', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: ru.app.title }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: ru.inputs.heading }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: ru.result.heading }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: ru.scene.label }),
    ).toBeInTheDocument()
  })
})
