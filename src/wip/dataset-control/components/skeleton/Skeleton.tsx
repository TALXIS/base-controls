import { Shimmer, ShimmerElementType } from "@fluentui/react"
import { useMemo } from "react";
import { getSkeletonStyles } from "./styles";

const ROW_COUNT = 5;
const COLUMN_COUNT = 4;

const getRowElements = (height: number) =>
    Array.from({ length: COLUMN_COUNT }, (_, i) => ([
        { type: ShimmerElementType.line, width: `${100 / COLUMN_COUNT}%`, height },
        ...(i < COLUMN_COUNT - 1 ? [{ type: ShimmerElementType.gap as const, width: 8, height }] : [])
    ])).flat();

export const Skeleton = () => {
    const styles = useMemo(() => getSkeletonStyles(), []);
    return (
        <div className={styles.root}>
            <Shimmer
                shimmerElements={getRowElements(12)}
                styles={{ root: styles.headerRow }}
            />
            {Array.from({ length: ROW_COUNT }, (_, i) => (
                <Shimmer
                    key={i}
                    shimmerElements={getRowElements(16)}
                    width="100%"
                    styles={{ root: styles.row }}
                />
            ))}
        </div>
    );
}