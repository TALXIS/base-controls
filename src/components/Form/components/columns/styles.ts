import { mergeStyleSets } from "@fluentui/react";
import { widthToSpan } from "../shared/layout";

interface IColumnStyleInput {
    width?: string;
    minWidth?: string;
}

const buildColumnSelectors = (children: IColumnStyleInput[], cols: number) => {
    return children.reduce<Record<string, { gridColumn: string; minWidth?: string }>>((selectors, child, index) => {
        const span = widthToSpan(child.width, cols);

        selectors[`> *:nth-of-type(${index + 1})`] = {
            gridColumn: `span ${span} / span ${span}`,
            minWidth: child.minWidth,
        };

        return selectors;
    }, {});
};

export const getColumnsStyles = (children: IColumnStyleInput[] = []) => {
    return mergeStyleSets({
        columns: {
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            columnGap: 16,
            rowGap: 16,
            alignItems: "start",
            selectors: {
                ...buildColumnSelectors(children, 12),
                "@media (max-width: 767px)": {
                    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                    ...buildColumnSelectors(children, 6),
                },
                "@media (max-width: 479px)": {
                    gridTemplateColumns: "minmax(0, 1fr)",
                    ...buildColumnSelectors(children, 1),
                },
            },
        },
    });
};