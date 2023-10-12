import { Switcher } from '@/elements/Switcher'
import { useEffect, useState } from 'react'

type TThemeTypes = 'light' | 'dark'

export const DarkModeSwitch = () => {
  const [activeTheme, setActiveTheme] = useState<TThemeTypes>(() => {
    // Retrieve the theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') as TThemeTypes
    return savedTheme || 'light'
  })

  const availableThemes: Array<{ value: TThemeTypes; label: string }> = [
    { value: 'light', label: 'light' },
    { value: 'dark', label: 'dark' }
  ]

  useEffect(() => {
    localStorage.setItem('theme', activeTheme)

    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  return (
    <Switcher
      activeIndex={availableThemes.findIndex(
        (item) => item.value === activeTheme
      )}
    >
      {availableThemes.map((item, index) => (
        <span
          key={index}
          onClick={() => {
            setActiveTheme(item.value)
          }}
        >
          {item.label}
        </span>
      ))}
    </Switcher>
  )
}
