export type PresetId = 'cygnusX1' | 'sgrA' | 'm87' | 'ton618' | 'gargantua'

export interface BlackHolePreset {
  id: PresetId
  /** Масса в массах Солнца. Оценки приближённые. */
  solarMasses: number
  /** Вымышленный объект (в первоисточнике дыра вращается, модель — нет). */
  fictional?: boolean
}

export const PRESETS: readonly BlackHolePreset[] = [
  { id: 'cygnusX1', solarMasses: 21 },
  { id: 'sgrA', solarMasses: 4.3e6 },
  { id: 'm87', solarMasses: 6.5e9 },
  { id: 'ton618', solarMasses: 4e10 },
  { id: 'gargantua', solarMasses: 1e8, fictional: true },
]

export const DEFAULT_PRESET_ID: PresetId = 'sgrA'
