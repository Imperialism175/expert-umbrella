import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { ru } from '@/i18n/ru'

function setup() {
  render(<App />)
  return userEvent.setup()
}

const timeInput = () => screen.getByLabelText(ru.inputs.time.earth)
const massInput = () => screen.getByLabelText(ru.inputs.mass.label)
const distanceInput = () => screen.getByLabelText(ru.inputs.distance.label)

describe('App', () => {
  it('показывает расчёт для значений по умолчанию', () => {
    setup()

    expect(
      screen.getByRole('heading', { level: 1, name: ru.app.title }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: ru.scene.label }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 год')).toBeInTheDocument()
    expect(screen.getByText('8 месяцев 15 дней')).toBeInTheDocument()
    expect(screen.getByText(ru.regime.noticeable)).toBeInTheDocument()
    expect(screen.getByText(/в 1,41 раза медленнее/)).toBeInTheDocument()
  })

  it('пересчитывает результат при вводе', async () => {
    const user = setup()

    await user.clear(timeInput())
    await user.type(timeInput(), '10')

    expect(screen.getByText('10 лет')).toBeInTheDocument()
    expect(screen.getByText('7 лет 1 месяц')).toBeInTheDocument()
  })

  it('смена единицы пересчитывает число, а не результат', async () => {
    const user = setup()

    await user.selectOptions(
      screen.getByLabelText(`${ru.inputs.unitLabel}: ${ru.inputs.time.earth}`),
      'h',
    )

    expect(timeInput()).toHaveValue('8766')
    expect(screen.getByText('8 месяцев 15 дней')).toBeInTheDocument()
  })

  it('объясняет, что на горизонте и под ним расчёт невозможен', async () => {
    const user = setup()

    await user.clear(distanceInput())
    await user.type(distanceInput(), '0')
    expect(screen.getByText(ru.errors.AT_HORIZON)).toBeInTheDocument()

    await user.click(
      screen.getByRole('radio', { name: ru.inputs.distance.center }),
    )
    await user.clear(distanceInput())
    await user.type(distanceInput(), '0,5')
    expect(screen.getByText(ru.errors.INSIDE_HORIZON)).toBeInTheDocument()
  })

  it('пустое поле даёт подсказку, а ошибка в поле появляется после ухода из него', async () => {
    const user = setup()

    await user.clear(massInput())
    expect(screen.getByText(ru.errors.INVALID_INPUT)).toBeInTheDocument()
    expect(screen.queryByText(ru.fieldErrors.INVALID_INPUT)).toBeNull()

    await user.tab()
    expect(screen.getByText(ru.fieldErrors.INVALID_INPUT)).toBeInTheDocument()
    expect(massInput()).toBeInvalid()
  })

  it('режим орбиты показывает данные орбиты и предупреждение', async () => {
    const user = setup()

    await user.click(screen.getByRole('radio', { name: ru.inputs.mode.orbit }))

    expect(screen.getByText(ru.warnings.UNSTABLE_ORBIT)).toBeInTheDocument()
    expect(screen.getByText(ru.details.orbitalPeriod)).toBeInTheDocument()
    expect(screen.queryByText(ru.details.hover)).toBeNull()
  })

  it('пресет подставляет массу и отмечается выбранным', async () => {
    const user = setup()
    const chip = screen.getByRole('button', { name: ru.presets.cygnusX1.name })

    await user.click(chip)

    expect(massInput()).toHaveValue('21')
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(ru.warnings.LETHAL_TIDES)).toBeInTheDocument()
  })

  it('обратный расчёт: по времени у дыры находит земное', async () => {
    const user = setup()

    await user.click(screen.getByRole('button', { name: ru.inputs.time.swap }))

    expect(screen.getByLabelText(ru.inputs.time.hole)).toHaveValue('1')
    expect(screen.getByText('1 год 5 месяцев')).toBeInTheDocument()
  })
})
