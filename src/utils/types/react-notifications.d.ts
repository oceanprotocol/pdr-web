import { ComponentType, ReactNode } from 'react'

declare module 'react-notifications' {
  export interface NotificationProps {
    message: string
    children?: ReactNode
  }

  export interface NotificationManager {
    success(message: string, title: string, duration: number): void
    error(message: string, title: string, duration: number): void
  }

  export const NotificationContainer: ComponentType
  export const NotificationManager: NotificationManager
}
