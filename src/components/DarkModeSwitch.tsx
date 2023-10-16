import { Switcher } from '@/elements/Switcher'
import { useCallback, useEffect, useState } from 'react'

type TThemeTypes = 'light' | 'dark'

export const DarkModeSwitch = () => {
  const getDefaultTheme = useCallback((): TThemeTypes => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) return savedTheme as TThemeTypes

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }, [])

  const [activeTheme, setActiveTheme] = useState<TThemeTypes>(() =>
    getDefaultTheme()
  )

  const availableThemes: Array<{ value: TThemeTypes; label: string }> = [
    { value: 'light', label: 'light' },
    { value: 'dark', label: 'dark' }
  ]

  const handleActiveTheme = useCallback(
    ({
      theme,
      saveToStorage
    }: {
      theme: TThemeTypes
      saveToStorage: boolean
    }) => {
      if (saveToStorage) localStorage.setItem('theme', theme)

      document.documentElement.setAttribute('data-theme', theme)
      setActiveTheme(theme)
    },
    []
  )

  useEffect(() => {
    const defaultTheme = getDefaultTheme()
    handleActiveTheme({ theme: defaultTheme, saveToStorage: false })
  }, [getDefaultTheme, handleActiveTheme])

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
            handleActiveTheme({ theme: item.value, saveToStorage: true })
            //setActiveTheme(item.value)
          }}
        >
          {item.label}
        </span>
      ))}
    </Switcher>
  )
}
