import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { getSkeletonStyles } from './styles';

/** Props for {@link Skeleton}. */
export interface ISkeletonProps {
    /** Container height. Left unset, the placeholder is as tall as its rows. */
    height?: string;
    /**
     * Flex spec per column, the first of which is drawn as a control column. Defaults to the six columns
     * of a task grid: checkbox, name, status, assignee, due date, priority.
     */
    columns?: string[];
    rowCount?: number;
    /** The ribbon above the columns. */
    showHeader?: boolean;
    /** The bar below the rows, where a record count and the pagination sit. */
    showFooter?: boolean;
}

const DEFAULT_COLUMNS = ['0 0 32px', '2 1 0', '1 1 0', '1 1 0', '1 1 0', '1 1 0'];
const DEFAULT_ROW_COUNT = 20;

//how much of each column the shimmer fills, indexed modulo their length so a column count other than the
//default still resolves a ratio. Index 0 is the control column, which draws a box instead of a line
const COLUMN_HEADER_FILL = [0, 0.50, 0.60, 0.55, 0.70, 0.50];
const ROW_PATTERNS = [
    [0, 0.70, 0.60, 0.80, 0.50, 0.70],
    [0, 0.50, 0.90, 0.40, 0.70, 0.60],
    [0, 0.85, 0.50, 0.60, 0.60, 0.90],
    [0, 0.60, 0.70, 0.90, 0.80, 0.50],
    [0, 0.90, 0.40, 0.70, 0.50, 0.80],
];

/** The loading placeholder shown until a dataset control instance resolves. */
export const Skeleton = (props: ISkeletonProps) => {
    const theme = useTheme();
    //the rows only grow into a container with a height of its own; without one they define it themselves
    const styles = React.useMemo(() => getSkeletonStyles(theme, !!props.height), [theme, !!props.height]);
    const columns = props.columns ?? DEFAULT_COLUMNS;
    const rowCount = props.rowCount ?? DEFAULT_ROW_COUNT;
    const showHeader = props.showHeader ?? true;
    const showFooter = props.showFooter ?? true;

    const renderColumnCell = (flex: string, columnIndex: number, fill: number) => {
        return (
            <div key={columnIndex} className={styles.columnCell} style={{ flex }}>
                {columnIndex === 0
                    ? <div className={styles.checkboxShimmer} />
                    : <div className={styles.shimmerLine} style={{ width: `${fill * 100}%` }} />
                }
            </div>
        );
    };

    return (
        <div className={styles.root} style={{ height: props.height }}>
            {showHeader &&
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerPill} style={{ width: 120 }} />
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.headerPill} style={{ width: 100 }} />
                        <div className={styles.headerPill} style={{ width: 100 }} />
                        <div className={styles.headerPill} style={{ width: 90 }} />
                        <div className={styles.headerPill} style={{ width: 160 }} />
                    </div>
                </div>
            }

            <div className={styles.columnHeaderRow}>
                {columns.map((flex, columnIndex) => renderColumnCell(flex, columnIndex, COLUMN_HEADER_FILL[columnIndex % COLUMN_HEADER_FILL.length]))}
            </div>

            <div className={styles.rows}>
                {Array.from({ length: rowCount }, (_, rowIndex) => {
                    const pattern = ROW_PATTERNS[rowIndex % ROW_PATTERNS.length];
                    return (
                        <div key={rowIndex} className={styles.row}>
                            {columns.map((flex, columnIndex) => renderColumnCell(flex, columnIndex, pattern[columnIndex % pattern.length]))}
                        </div>
                    );
                })}
            </div>
            {showFooter &&
                <div className={styles.footer}>
                    <div className={styles.headerPill} style={{ width: 110 }} />
                </div>
            }
        </div>
    );
};
