export type MakePropertiesNullable<T> = { [P in keyof T]-?: null extends T[P] ? T[P] : T[P] | null };
