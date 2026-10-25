export const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6;
};
