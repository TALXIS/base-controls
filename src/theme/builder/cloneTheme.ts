import { ITheme } from "../interfaces";

/** A copy nothing of the original is shared with, bar the functions a component's styles can be. */
//not `structuredClone`: it throws on a function, and a theme's component styles are allowed to be one
export const cloneTheme = (theme: ITheme): ITheme => cloneDeep(theme);

const cloneDeep = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(entry => cloneDeep(entry)) as T;
    }
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
        return value;
    }
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneDeep(entry)])) as T;
};
