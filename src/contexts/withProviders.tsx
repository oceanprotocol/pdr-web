import React from 'react'

export const withProviders = (
  providers: { provider: React.ComponentType<any>; props?: any }[],
  children: React.ReactNode
): React.ReactNode => {
  return providers.reverse().reduce((acc, curr) => {
    return React.createElement(curr.provider, curr.props, acc)
  }, children)
}
