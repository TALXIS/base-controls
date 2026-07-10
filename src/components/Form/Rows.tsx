import * as React from "react";
import { ResponsiveLayoutGrid } from "./ResponsiveLayoutGrid";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_STACK_LAYOUT_COLS,
    mergeResponsiveCols,
    type FormResponsiveCols,
} from "./layout";

type RowChildProps = {
    layoutHeightUnits?: number;
};

export interface IFormRowsProps {
    className?: string;
    responsiveCols?: Partial<FormResponsiveCols>;
    rowHeight?: number;
    margin?: readonly [number, number];
    containerPadding?: readonly [number, number];
    children?: React.ReactNode;
}

export const Rows: React.FC<IFormRowsProps> = ({
    className,
    responsiveCols,
    rowHeight = 48,
    margin = [0, 12],
    containerPadding = [0, 0],
    children,
}) => {
    const rowChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<RowChildProps> => React.isValidElement<RowChildProps>(child));

    if (rowChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_STACK_LAYOUT_COLS, responsiveCols);
    const layouts = buildSequentialResponsiveLayouts(
        rowChildren.map((child, index) => ({
            key: String(child.key ?? `form-row-${index}`),
            span: 1,
            height: child.props.layoutHeightUnits,
        })),
        cols,
        () => 1,
    );

    return (
        <ResponsiveLayoutGrid
            dataId="form-rows"
            className={className}
            layouts={layouts}
            cols={cols}
            rowHeight={rowHeight}
            margin={margin}
            containerPadding={containerPadding}
        >
            {rowChildren}
        </ResponsiveLayoutGrid>
    );
};
