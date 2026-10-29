import type { ILabelSet } from "./defineLabels";

/** Strings by key, such as `'pagination.currentPage'`, already in the user's language. */
export type Labels = Record<string, string>;

type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer R} ` ? Trim<R> : S;
type VariableName<S extends string> = S extends `${infer Name}|${string}` ? Trim<Name> : Trim<S>;

/** The `{{ variable }}` names of a string. */
export type LabelVariables<S extends string> = S extends `${string}{{${infer V}}}${infer Rest}` ? VariableName<V> | LabelVariables<Rest> : never;

export type LabelArguments<S extends string> = [LabelVariables<S>] extends [never] ? [] : [variables: Record<LabelVariables<S>, string | number>];

/** The strings of one set. */
export interface ILabels<T extends Labels> {
    get<K extends keyof T & string>(key: K, ...variables: LabelArguments<T[K]>): string;
}

/** The labels of one set, for typing a field. */
export type LabelsOf<S extends ILabelSet> = S extends ILabelSet<infer T> ? ILabels<T> : never;
