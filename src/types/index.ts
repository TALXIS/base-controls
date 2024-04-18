export type StringProps<T> = {
    [Property in keyof T]: string
};