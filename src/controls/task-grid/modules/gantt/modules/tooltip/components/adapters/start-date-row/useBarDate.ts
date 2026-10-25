import { useTaskTooltip } from "../task-tooltip";

/** A date of the bar, formatted as its column formats it, with the column's name as its label. */
export const useBarDate = (date: Date | undefined, columnName: string): { label: string; value: string } | undefined => {
    const { gantt } = useTaskTooltip();
    const provider = gantt.getTaskRuntime().getProvider();
    const column = provider.getColumnsMap()[columnName];
    const value = date && provider.getFormatting().format({ value: date, column });
    return value ? { label: column?.displayName ?? columnName, value } : undefined;
};
