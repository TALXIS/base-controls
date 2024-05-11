export type StringProps<T> = {
    [Property in keyof T]: (variables?: any) => string
};