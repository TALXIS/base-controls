import * as React from "react";
import { RowContext } from "./context";
import { useSectionContext } from "../section";
import { useRowsContext } from "../rows";
import { ResponsiveLayoutGrid } from "../shared";
import { buildRowLayoutCols, buildSequentialResponsiveLayouts, mergeResponsiveCols, normalizeLayoutKey, type FormResponsiveCols } from "../shared";

export interface IFormRowProps {
    height?: string;
    children?: React.ReactNode;
}

type CellChildProps = {
    colspan?: number;
    rowspan?: number;
    visible?: boolean;
    cell?: {
        colspan?: number;
        rowspan?: number;
        visible?: boolean;
    };
};

export const Row: React.FC<IFormRowProps> = ({
    height,
    children,
}) => {
    useRowsContext();

    const section = useSectionContext();
    const cellChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<CellChildProps> => React.isValidElement<CellChildProps>(child))
        .filter((child) => child.props.visible !== false && child.props.cell?.visible !== false);

    if (cellChildren.length === 0) {
        return null;
    }

    const resolvedColumns = Math.max(section.sectionColumns ?? cellChildren.length, 1);
    const cols = mergeResponsiveCols(buildRowLayoutCols(resolvedColumns));
    const layouts = buildSequentialResponsiveLayouts(
        cellChildren.map((child, index) => ({
            key: normalizeLayoutKey(child.key, `form-row-cell-${index}`),
            span: child.props.colspan ?? child.props.cell?.colspan,
            height: child.props.rowspan ?? child.props.cell?.rowspan,
        })),
        cols,
        (item) => item.span ?? 1,
    );

    return (
        <RowContext.Provider value={{ height }}>
            <div>
                <ResponsiveLayoutGrid
                    dataId="form-row"
                    layouts={layouts}
                    cols={cols}
                    rowHeight={section.rowHeight ?? 48}
                    margin={[12, 12]}
                    containerPadding={[0, 0]}
                >
                    {cellChildren}
                </ResponsiveLayoutGrid>
            </div>
        </RowContext.Provider>
    );
};
