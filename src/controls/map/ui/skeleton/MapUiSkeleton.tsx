import { useMemo } from "react";
import { mergeStyles } from "@fluentui/react";
import { useTheme } from "@theme";
import { EDIT_COLUMNS_WIDTH, QUICK_FIND_WIDTH, RIBBON_WIDTH, VIEW_SWITCHER_WIDTH } from "@controls/dataset-control/ui/layout";
import { getDatasetControlUiSkeletonStyles } from "@controls/dataset-control/ui/skeleton/styles";
import { getMapUiSkeletonStyles } from "./styles";

/** What the placeholder is shaped like; fits `DatasetControl`'s `components.skeleton.onRender`. */
export interface IMapUiSkeletonProps {
    /** Container height. Left unset, the map placeholder is 400px tall. */
    height?: string;
    /** The ribbon above the map. */
    showHeader?: boolean;
}

const REGIONS = [
    'M120 80 C220 40 340 90 360 170 C380 250 280 300 190 280 C100 260 40 140 120 80 Z',
    'M620 260 C720 210 860 240 880 330 C900 420 760 470 660 430 C580 400 540 300 620 260 Z',
];
const MAIN_ROADS = [
    'M0 330 C180 300 300 360 480 300 S800 160 1000 200',
    'M300 0 C320 140 420 220 470 320 S520 460 560 500',
];
const SIDE_ROADS = [
    'M640 0 C620 90 700 160 760 200 S900 320 1000 340',
    'M0 120 C150 140 260 90 400 110 S560 60 700 90',
    'M470 320 C560 360 600 420 760 440',
];
const PINS = [[250, 200], [430, 290], [560, 160], [700, 330], [820, 220], [380, 120]];
//a teardrop whose tip is at the origin
const PIN_PATH = 'M0 0 C-4 -9 -12 -14 -12 -22 A12 12 0 1 1 12 -22 C12 -14 4 -9 0 0 Z';

/** A shimmering placeholder shaped like a ribbon and a map with pins. */
export const MapUiSkeleton = (props: IMapUiSkeletonProps) => {
    const theme = useTheme();
    const hasFixedHeight = !!props.height;
    const styles = useMemo(() => getDatasetControlUiSkeletonStyles(theme, hasFixedHeight, props.height === '100%'), [theme, hasFixedHeight, props.height]);
    const mapStyles = useMemo(() => getMapUiSkeletonStyles(theme, hasFixedHeight), [theme, hasFixedHeight]);
    const showHeader = props.showHeader ?? true;

    return (
        <div className={styles.datasetControlSkeleton} style={{ height: props.height }}>
            {showHeader &&
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerPill} style={{ width: VIEW_SWITCHER_WIDTH }} />
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.headerPill} style={{ width: RIBBON_WIDTH }} />
                        <div className={styles.headerPill} style={{ width: EDIT_COLUMNS_WIDTH }} />
                        <div className={styles.headerPill} style={{ width: QUICK_FIND_WIDTH }} />
                    </div>
                </div>
            }
            <div className={mergeStyles(styles.shimmerLine, mapStyles.map)}>
                <svg className={mapStyles.drawing} viewBox='0 0 1000 500' preserveAspectRatio='xMidYMid slice' aria-hidden>
                    {REGIONS.map(path => <path key={path} className={mapStyles.region} d={path} />)}
                    {MAIN_ROADS.map(path => <path key={path} className={mapStyles.road} d={path} strokeWidth={10} />)}
                    {SIDE_ROADS.map(path => <path key={path} className={mapStyles.road} d={path} strokeWidth={5} />)}
                    {PINS.map(([x, y]) =>
                        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                            <path className={mapStyles.pin} d={PIN_PATH} />
                            <circle className={mapStyles.pinDot} cy={-22} r={4.5} />
                        </g>
                    )}
                </svg>
                <div className={mapStyles.zoom} />
            </div>
        </div>
    );
};
