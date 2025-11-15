declare module 'react-notifications' {
  export interface NotificationProps {
    message: string
    children?: ReactNode
  }

  export interface NotificationManager {
    success(message: string, title: string, ms: number): void
    error(message: string, title: string, ms: number): void
  }

  export const NotificationContainer: ComponentType
  export const NotificationManager: NotificationManager
}
