import { IconButton, useTheme } from "@fluentui/react";
import { useEffect, useMemo, useRef } from "react";
import { IZoomSliderComponents, ZoomSliderComponents } from "./components";
import { getZoomSliderStyles } from "./styles";

const HOLD_DELAY = 300;
const HOLD_INTERVAL = 75;

export interface IZoomSliderProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    /** Accessible name of the slider itself. */
    ariaLabel?: string;
    components?: Partial<IZoomSliderComponents>;
}

export const ZoomSlider = (props: IZoomSliderProps) => {
    const { onChange, disabled } = props;
    const valuerRef = useRef(props.value);
    valuerRef.current = props.value;
    const theme = useTheme();
    const components = useMemo(() => ({ ...ZoomSliderComponents, ...props.components }), []);
    const styles = useMemo(() => getZoomSliderStyles(theme, disabled), [disabled, theme]);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const changeZoomLevel = (step: number) => {
        onChange(valuerRef.current + step);
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

    const startHold = (step: number) => {
        stopHold();
        holdTimeoutRef.current = setTimeout(() => {
            holdIntervalRef.current = setInterval(() => {
                changeZoomLevel(step);
            }, HOLD_INTERVAL);
        }, HOLD_DELAY);
    };

    useEffect(() => {
        return () => {
            stopHold();
        };
    }, []);


    return (
        <div className={styles.root}>
            <IconButton
                disabled={disabled}
                className={styles.zoomButton}
                iconProps={{ iconName: 'Remove' }}
                onClick={() => changeZoomLevel(-1)}
                onMouseDown={() => startHold(-1)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
            />
            {components.onRenderSlider({
                disabled: disabled,
                ariaLabel: props.ariaLabel,
                className: styles.slider,
                min: 0,
                max: 100,
                value: valuerRef.current,
                showValue: false,
                styles: {
                    thumb: styles.thumb,
                    activeSection: styles.activeSection
                },
                onChange: onChange
            })}
            <IconButton
                disabled={disabled}
                className={styles.zoomButton}
                iconProps={{ iconName: 'Add' }}
                onClick={() => changeZoomLevel(1)}
                onMouseDown={() => startHold(1)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
            />
        </div>
    );
}