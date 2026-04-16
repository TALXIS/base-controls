import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { getSkeletonStyles } from './styles';

export interface ISkeletonProps {
    height: string;
}

// flex values per column: checkbox, name (wide), status, assignee, due date, priority
const COLUMN_FLEX = ['0 0 32px', '2 1 0', '1 1 0', '1 1 0', '1 1 0', '1 1 0'];
const COLUMN_HEADER_FILL = [0, 0.50, 0.60, 0.55, 0.70, 0.50];

// cell fill ratios per column (index 0 = checkbox column, skipped)
const ROW_PATTERNS = [
    [0, 0.70, 0.60, 0.80, 0.50, 0.70],
    [0, 0.50, 0.90, 0.40, 0.70, 0.60],
    [0, 0.85, 0.50, 0.60, 0.60, 0.90],
    [0, 0.60, 0.70, 0.90, 0.80, 0.50],
    [0, 0.90, 0.40, 0.70, 0.50, 0.80],
];

const ROW_COUNT = 20;

export const Skeleton = ({ height }: ISkeletonProps) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getSkeletonStyles(theme), [theme]);

    return (
        <div className={styles.root} style={{height: height}}>
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

            <div className={styles.columnHeaderRow}>
                {COLUMN_FLEX.map((flex, i) => (
                    <div key={i} className={styles.columnCell} style={{ flex }}>
                        {i === 0
                            ? <div className={styles.checkboxShimmer} />
                            : <div className={styles.shimmerLine} style={{ width: `${COLUMN_HEADER_FILL[i] * 100}%` }} />
                        }
                    </div>
                ))}
            </div>

            <div className={styles.rows}>
                {Array.from({ length: ROW_COUNT }, (_, rowIdx) => {
                    const pattern = ROW_PATTERNS[rowIdx % ROW_PATTERNS.length];
                    return (
                        <div key={rowIdx} className={styles.row}>
                            {COLUMN_FLEX.map((flex, colIdx) => (
                                <div key={colIdx} className={styles.columnCell} style={{ flex }}>
                                    {colIdx === 0
                                        ? <div className={styles.checkboxShimmer} />
                                        : <div className={styles.shimmerLine} style={{ width: `${pattern[colIdx] * 100}%` }} />
                                    }
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
            <div className={styles.footer}>
                <div className={styles.headerPill} style={{ width: 110 }} />
            </div>
        </div>
    );
};