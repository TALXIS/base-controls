import * as React from "react";
import { RowsContext } from "./context";
import { useSectionContext } from "../section";
import { ResponsiveLayoutGrid } from "../shared";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_STACK_LAYOUT_COLS,
    mergeResponsiveCols,
    normalizeLayoutKey,
    type FormResponsiveCols,
} from "../shared";

type RowChildProps = {
    children?: React.ReactNode;
};

export interface IFormRowsProps {
    children?: React.ReactNode;
}

type CellLayoutProps = {
    rowspan?: number;
    cell?: {
        rowspan?: number;
    };
};

export const Rows: React.FC<IFormRowsProps> = ({ children }) => {
    useSectionContext();

    const rowChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<RowChildProps> => React.isValidElement<RowChildProps>(child));

    if (rowChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_STACK_LAYOUT_COLS);
    const layouts = buildSequentialResponsiveLayouts(
        rowChildren.map((child, index) => ({
            key: normalizeLayoutKey(child.key, `form-row-${index}`),
            span: 1,
            height: getRowHeightUnits(child.props.children),
        })),
        cols,
        () => 1,
    );

    return (
        <RowsContext.Provider value={true}>
            <ResponsiveLayoutGrid
                dataId="form-rows"
                layouts={layouts}
                cols={cols}
                rowHeight={48}
                margin={[0, 12]}
                containerPadding={[0, 0]}
            >
                {rowChildren}
            </ResponsiveLayoutGrid>
        </RowsContext.Provider>
    );
};

const getRowHeightUnits = (children: React.ReactNode): number => {
    const cellChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<CellLayoutProps> => React.isValidElement<CellLayoutProps>(child));

    return Math.max(
        1,
        ...cellChildren.map((child) => child.props.rowspan ?? child.props.cell?.rowspan ?? 1),
    );
};
