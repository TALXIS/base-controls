/**
 * Accepts an array of classes and returns a string of class names
 */
export const getClassNames = (classes: (string | undefined)[]): string | undefined => {
    let classNames = '';
    classes.map(className => {
        if (className) {
            classNames += ` ${className}`;
        }
    })
    return classNames || undefined;
}