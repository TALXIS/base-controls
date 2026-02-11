export const getClassNames = (classNames: (string | undefined)[]) => {
    return classNames.filter(name => !!name).join(' ');
}