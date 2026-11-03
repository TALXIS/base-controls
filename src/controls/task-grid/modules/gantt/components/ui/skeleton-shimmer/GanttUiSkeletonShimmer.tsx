import { useTheme } from "@theme";
import { useMemo } from "react";

import { getGanttUiSkeletonShimmerStyles } from "./styles";

/** What the placeholder is shaped like. */
export interface IGanttUiSkeletonShimmerProps {
    /** The height of the time scale (default `42`). */
    scaleHeight?: number;
    /** The height of a row (default `42`). */
    rowHeight?: number;
    /** How many rows the placeholder draws. */
    rowCount?: number;
}

type BarKind = 'task' | 'summary' | 'milestone';

interface IBarPattern {
    kind: BarKind;
    /** In columns from the left. */
    start: number;
    /** In columns. */
    length: number;
}

const DEFAULT_SCALE_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_ROW_COUNT = 30;
const COLUMN_WIDTH = 56;
const COLUMNS_PER_SPAN = 7;
const COLUMN_COUNT = 56;
const SPAN_LABEL_WIDTHS = [72, 88, 64, 80];

//a phase and its tasks stepping down and to the right, as a plan does
const BAR_PATTERNS: IBarPattern[] = [
    { kind: 'summary', start: 1, length: 11 },
    { kind: 'task', start: 1, length: 3 },
    { kind: 'task', start: 4, length: 4.5 },
    { kind: 'task', start: 6, length: 2.5 },
    { kind: 'milestone', start: 8.5, length: 0 },
    { kind: 'task', start: 8.5, length: 3.5 },
    { kind: 'summary', start: 9, length: 10 },
    { kind: 'task', start: 9, length: 2 },
    { kind: 'task', start: 11, length: 5 },
    { kind: 'task', start: 13, length: 3 },
    { kind: 'task', start: 16, length: 3 },
    { kind: 'milestone', start: 19, length: 0 },
];
const PATTERN_SHIFT = 18;

/** A shimmering placeholder shaped like a time scale over rows of bars. */
export const GanttUiSkeletonShimmer = (props: IGanttUiSkeletonShimmerProps) => {
    const theme = useTheme();
    const scaleHeight = props.scaleHeight ?? DEFAULT_SCALE_HEIGHT;
    const rowHeight = props.rowHeight ?? DEFAULT_ROW_HEIGHT;
    const rowCount = props.rowCount ?? DEFAULT_ROW_COUNT;
    const styles = useMemo(() => getGanttUiSkeletonShimmerStyles(theme, { scaleHeight, rowHeight, columnWidth: COLUMN_WIDTH, columnsPerSpan: COLUMNS_PER_SPAN, spanLabelWidths: SPAN_LABEL_WIDTHS }), [theme, scaleHeight, rowHeight]);

    const renderBar = (pattern: IBarPattern, shift: number) => {
        const left = (pattern.start + shift) * COLUMN_WIDTH;
        if (pattern.kind === 'milestone') {
            return <div className={`${styles.bar} ${styles.milestone}`} style={{ left }} />;
        }
        const className = pattern.kind === 'summary' ? `${styles.bar} ${styles.summaryBar}` : styles.bar;
        return <div className={className} style={{ left, width: pattern.length * COLUMN_WIDTH }} />;
    };

    return <div className={styles.skeleton}>
        <div className={styles.scale}>
            <div className={styles.scaleLine}>
                {Array.from({ length: COLUMN_COUNT / COLUMNS_PER_SPAN }, (_, index) => <div key={index} className={`${styles.scaleCell} ${styles.spanCell}`}>
                    <div className={styles.spanLabel} />
                </div>)}
            </div>
            <div className={styles.scaleLine}>
                {Array.from({ length: COLUMN_COUNT }, (_, index) => <div key={index} className={`${styles.scaleCell} ${styles.unitCell}`}>
                    <div className={styles.unitLabel} />
                </div>)}
            </div>
        </div>
        <div className={styles.body}>
            {Array.from({ length: rowCount }, (_, index) => <div key={index} className={styles.row}>
                {renderBar(BAR_PATTERNS[index % BAR_PATTERNS.length], Math.floor(index / BAR_PATTERNS.length) * PATTERN_SHIFT)}
            </div>)}
        </div>
    </div>;
};
