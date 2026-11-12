import { useTheme } from "@theme";
import { useEffect, useMemo, useRef } from "react";
import { GanttUiZoomSliderComponents, IGanttUiZoomSliderComponents } from "./components";
import { getGanttUiZoomSliderStyles } from "./styles";
import { useLatest } from "@core";

const HOLD_DELAY = 300;
const HOLD_INTERVAL = 75;

export interface IGanttUiZoomSliderProps {
    value: number;
    onChange: (value: number) => void;
    /** Defaults to `0`. */
    min?: number;
    /** Defaults to `100`. */
    max?: number;
    /** What the slider snaps to and the buttons move by without `buttonStep` (default `1`). */
    step?: number;
    /** What the buttons move by (default `step`). */
    buttonStep?: number;
    disabled?: boolean;
    /** Accessible name of the slider itself. */
    ariaLabel?: string;
    /** Accessible name and tooltip of the button that moves down. */
    zoomOutLabel?: string;
    /** Accessible name and tooltip of the button that moves up. */
    zoomInLabel?: string;
    components?: Partial<IGanttUiZoomSliderComponents>;
}

export const GanttUiZoomSlider = (props: IGanttUiZoomSliderProps) => {
    const { onChange, disabled, min = 0, max = 100, step = 1 } = props;
    const valueRef = useLatest(props.value);
    const theme = useTheme();
    const components = { ...GanttUiZoomSliderComponents, ...props.components };
    const styles = useMemo(() => getGanttUiZoomSliderStyles(theme, disabled), [disabled, theme]);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasHeldRef = useRef(false);

    const changeZoomLevel = (direction: number) => {
        onChange(Math.max(min, Math.min(max, valueRef.current + direction * (props.buttonStep ?? step))));
    };

    const stopHold = () => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
    };

    const startHold = (direction: number) => {
        stopHold();
        hasHeldRef.current = false;
        holdTimeoutRef.current = setTimeout(() => {
            holdIntervalRef.current = setInterval(() => {
                hasHeldRef.current = true;
                changeZoomLevel(direction);
            }, HOLD_INTERVAL);
        }, HOLD_DELAY);
    };

    const onButtonClick = (direction: number) => {
        if (!hasHeldRef.current) {
            changeZoomLevel(direction);
        }
        hasHeldRef.current = false;
    };

    useEffect(() => {
        return () => {
            stopHold();
        };
    }, []);

    return components.onRender({
        className: styles.root,
        children: <>
            {components.onRenderZoomButton({
                disabled: disabled,
                className: styles.zoomButton,
                iconProps: { iconName: 'Remove' },
                ariaLabel: props.zoomOutLabel,
                title: props.zoomOutLabel,
                onClick: () => onButtonClick(-1),
                onMouseDown: () => startHold(-1),
                onMouseUp: stopHold,
                onMouseLeave: stopHold,
            })}
            {components.onRenderSlider({
                disabled: disabled,
                ariaLabel: props.ariaLabel,
                className: styles.slider,
                min: min,
                max: max,
                step: step,
                value: valueRef.current,
                showValue: false,
                styles: {
                    thumb: styles.thumb,
                    activeSection: styles.activeSection
                },
                onChange: onChange
            })}
            {components.onRenderZoomButton({
                disabled: disabled,
                className: styles.zoomButton,
                iconProps: { iconName: 'Add' },
                ariaLabel: props.zoomInLabel,
                title: props.zoomInLabel,
                onClick: () => onButtonClick(1),
                onMouseDown: () => startHold(1),
                onMouseUp: stopHold,
                onMouseLeave: stopHold,
            })}
        </>,
    });
};
