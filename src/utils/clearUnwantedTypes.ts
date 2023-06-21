type NotWanted = Error | null | undefined

export const notAWantedType = <T>(value: T | NotWanted): value is T => {
  return !(value instanceof Error || value === null || value === undefined)
}

export const filterOutUnwantedTypes = <T>(arr: Array<T | NotWanted>): T[] => {
  return arr.filter(notAWantedType)
}
