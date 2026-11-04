/**
 * Accepts an array of classes and returns a string of class names.
 */
export const getClassNames = (classes: (string | undefined)[] = []): string | undefined => {
    return classes.filter(className => className).join(' ') || undefined;
};
