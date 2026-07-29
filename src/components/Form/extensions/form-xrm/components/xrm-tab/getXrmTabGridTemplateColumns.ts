import { IFormXmlColumn } from "../../internal/FormXmlForm";

export const getXrmTabGridTemplateColumns = (columns: IFormXmlColumn[], columnsPerRow: number): string | undefined => {
    if (columns.length === 0 || columnsPerRow <= 0) {
        return undefined;
    }

    const parsedWidths = columns.map((column) => {
        const parsedWidth = Number.parseFloat(column.width ?? "");
        return Number.isFinite(parsedWidth) ? parsedWidth : undefined;
    });

    const definedWidthCount = parsedWidths.filter((width) => width != null).length;
    const totalDefinedWidth = parsedWidths.reduce<number>((sum, width) => sum + (width ?? 0), 0);
    const undefinedWidthCount = parsedWidths.length - definedWidthCount;
    const fallbackWidth = undefinedWidthCount > 0
        ? Math.max(0, 100 - totalDefinedWidth) / undefinedWidthCount
        : undefined;

    const normalizedWidths = parsedWidths.map((width) => width ?? fallbackWidth ?? (100 / columns.length));
    const activeRowWidths = normalizedWidths.slice(0, Math.min(columnsPerRow, normalizedWidths.length));
    const activeRowTotal = activeRowWidths.reduce<number>((sum, width) => sum + width, 0);

    if (activeRowWidths.length === 0 || activeRowTotal <= 0) {
        return undefined;
    }

    return activeRowWidths
        .map((width) => (width / activeRowTotal) * 100)
        .map((width) => `minmax(0, ${width}fr)`)
        .join(" ");
};