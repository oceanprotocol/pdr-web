import { Switcher } from '@/elements/Switcher'
import { useCallback, useEffect, useState } from 'react'

type TThemeTypes = 'light' | 'dark'

export const DarkModeSwitch = () => {
  /**
   * Get the default theme based on the user's OS settings
   */
  const getDefaultTheme = useCallback((): TThemeTypes => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme as TThemeTypes

    return 'light'
  }, [])

  /**
   * Set the active theme
   */
  const [activeTheme, setActiveTheme] = useState<TThemeTypes>(getDefaultTheme)

  const availableThemes: TThemeTypes[] = ['light', 'dark']

  /**
   * Handle the active theme
   */
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

  /**
   * Set the default theme on first load
   */
  useEffect(() => {
    const defaultTheme = getDefaultTheme()
    handleActiveTheme({ theme: defaultTheme, saveToStorage: false })
  }, [getDefaultTheme, handleActiveTheme])

  /**
   * Render the switcher
   */
  return (
    <Switcher
      activeIndex={availableThemes.findIndex((theme) => theme === activeTheme)}
    >
      {availableThemes.map((theme) => (
        <span
          key={theme}
          onClick={() => handleActiveTheme({ theme, saveToStorage: true })}
        >
          {theme}
        </span>
      ))}
    </Switcher>
  )
}
