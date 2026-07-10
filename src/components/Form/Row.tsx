import * as React from "react";
import { FormLayoutContext } from "./FormLayoutContext";
import { RowContext } from "./RowContext";
import { useRowsContext } from "./RowsContext";
import { ResponsiveLayoutGrid } from "./ResponsiveLayoutGrid";
import { buildRowLayoutCols, buildSequentialResponsiveLayouts, mergeResponsiveCols, normalizeLayoutKey, type FormResponsiveCols } from "./layout";

export interface IFormRowProps {
    className?: string;
    id?: string;
    style?: React.CSSProperties;
    columns?: number;
    responsiveCols?: Partial<FormResponsiveCols>;
    rowHeight?: number;
    layoutHeightUnits?: number;
    children?: React.ReactNode;
}

type CellChildProps = {
    colspan?: number;
    rowspan?: number;
    visible?: boolean;
};

export const Row: React.FC<IFormRowProps> = ({
    className,
    id,
    style,
    columns,
    responsiveCols,
    rowHeight,
    children,
}) => {
    useRowsContext();

    const layout = React.useContext(FormLayoutContext);
    const cellChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<CellChildProps> => React.isValidElement<CellChildProps>(child))
        .filter((child) => child.props.visible !== false);

    if (cellChildren.length === 0) {
        return null;
    }

    const resolvedColumns = Math.max(columns ?? layout.sectionColumns ?? cellChildren.length, 1);
    const cols = mergeResponsiveCols(buildRowLayoutCols(resolvedColumns), responsiveCols);
    const layouts = buildSequentialResponsiveLayouts(
        cellChildren.map((child, index) => ({
            key: normalizeLayoutKey(child.key, `${id ?? "form-row"}-cell-${index}`),
            span: child.props.colspan,
            height: child.props.rowspan,
        })),
        cols,
        (item) => item.span ?? 1,
    );

    return (
        <RowContext.Provider value={true}>
            <div style={style}>
                <ResponsiveLayoutGrid
                    dataId={id ?? "form-row"}
                    className={className}
                    layouts={layouts}
                    cols={cols}
                    rowHeight={rowHeight ?? layout.rowHeight ?? 48}
                    margin={[12, 12]}
                    containerPadding={[0, 0]}
                >
                    {cellChildren}
                </ResponsiveLayoutGrid>
            </div>
        </RowContext.Provider>
    );
};
