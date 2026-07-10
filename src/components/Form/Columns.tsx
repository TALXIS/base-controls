import * as React from "react";
import { ResponsiveLayoutGrid } from "./ResponsiveLayoutGrid";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_COLUMN_LAYOUT_COLS,
    mergeResponsiveCols,
    type FormResponsiveCols,
    widthToSpan,
} from "./layout";

type ColumnChildProps = {
    width?: React.CSSProperties["width"];
};

export interface IFormColumnsProps {
    className?: string;
    itemWidths?: Array<React.CSSProperties["width"] | undefined>;
    responsiveCols?: Partial<FormResponsiveCols>;
    rowHeight?: number;
    margin?: readonly [number, number];
    containerPadding?: readonly [number, number];
    children?: React.ReactNode;
}

export const Columns: React.FC<IFormColumnsProps> = ({
    className,
    itemWidths,
    responsiveCols,
    rowHeight = 1,
    margin = [16, 16],
    containerPadding = [0, 0],
    children,
}) => {
    const columnChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<ColumnChildProps> => React.isValidElement<ColumnChildProps>(child));

    if (columnChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_COLUMN_LAYOUT_COLS, responsiveCols);
    const layouts = buildSequentialResponsiveLayouts(
        columnChildren.map((child, index) => ({
            key: String(child.key ?? `form-column-${index}`),
            width: child.props.width ?? itemWidths?.[index],
        })),
        cols,
        (item, breakpointCols) => widthToSpan(item.width, breakpointCols),
    );

    return (
        <ResponsiveLayoutGrid
            dataId="form-columns"
            className={className}
            layouts={layouts}
            cols={cols}
            rowHeight={rowHeight}
            margin={margin}
            containerPadding={containerPadding}
        >
            {columnChildren}
        </ResponsiveLayoutGrid>
    );
};
