import * as React from "react";
import { ColumnsContext } from "./context";
import { useTabContext } from "../tab";
import { ResponsiveLayoutGrid } from "../shared";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_COLUMN_LAYOUT_COLS,
    mergeResponsiveCols,
    normalizeLayoutKey,
    type FormResponsiveCols,
    widthToSpan,
} from "../shared";
import { IFormColumnProps } from "../..";
import { getColumnsStyles } from "./styles";
import { useMemo } from "react";

type ColumnChildProps = {
    width?: React.CSSProperties["width"];
    column?: {
        width?: React.CSSProperties["width"];
    };
};

export interface IFormColumnsProps {
    children?: React.ReactNode;
}

export const Columns = (props: IFormColumnProps) => {
    const childrenArray = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const childCount = childrenArray.length;
    const styles = useMemo(() => getColumnsStyles(), [childCount]);

    return <div className={styles.columns}>
        {props.children}
    </div>
}

/* export const Columns = ({ children }: IFormColumnsProps) => {
    useTabContext();

    const columnChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<ColumnChildProps> => React.isValidElement<ColumnChildProps>(child));

    if (columnChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_COLUMN_LAYOUT_COLS);
    const layouts = buildSequentialResponsiveLayouts(
        columnChildren.map((child, index) => ({
            key: normalizeLayoutKey(child.key, `form-column-${index}`),
            width: child.props.width ?? child.props.column?.width,
        })),
        cols,
        (item, breakpointCols) => widthToSpan(item.width, breakpointCols),
    );

    return (
        <ColumnsContext.Provider value={true}>
            <ResponsiveLayoutGrid
                dataId="form-columns"
                layouts={layouts}
                cols={cols}
                rowHeight={24}
                margin={[16, 16]}
                containerPadding={[0, 0]}
            >
                {columnChildren}
            </ResponsiveLayoutGrid>
        </ColumnsContext.Provider>
    );
};
 */