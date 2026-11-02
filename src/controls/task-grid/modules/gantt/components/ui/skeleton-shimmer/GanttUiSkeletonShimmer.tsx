import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getGanttSkeletonShimmerStyles } from "./styles";

/** What the placeholder is shaped like. */
export interface IGanttSkeletonShimmerProps {
    /** The height of the time scale; defaults to the grid header's. */
    scaleHeight?: number;
    /** The height of a row; defaults to the grid row's. */
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
export const GanttSkeletonShimmer = (props: IGanttSkeletonShimmerProps) => {
    const theme = useTheme();
    const scaleHeight = props.scaleHeight ?? DEFAULT_SCALE_HEIGHT;
    const rowHeight = props.rowHeight ?? DEFAULT_ROW_HEIGHT;
    const rowCount = props.rowCount ?? DEFAULT_ROW_COUNT;
    const styles = useMemo(() => getGanttSkeletonShimmerStyles(theme, scaleHeight, rowHeight, COLUMN_WIDTH), [theme, scaleHeight, rowHeight]);

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
                {Array.from({ length: COLUMN_COUNT / COLUMNS_PER_SPAN }, (_, index) => <div key={index} className={styles.scaleCell} style={{ width: COLUMNS_PER_SPAN * COLUMN_WIDTH }}>
                    <div className={styles.spanLabel} style={{ width: SPAN_LABEL_WIDTHS[index % SPAN_LABEL_WIDTHS.length] }} />
                </div>)}
            </div>
            <div className={styles.scaleLine}>
                {Array.from({ length: COLUMN_COUNT }, (_, index) => <div key={index} className={styles.scaleCell} style={{ width: COLUMN_WIDTH }}>
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
