export type Maybe<T> = T | null

export type ElementOf<T> = T extends (infer E)[] ? E : never
