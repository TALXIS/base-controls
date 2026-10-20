import { ThemeProvider } from '@fluentui/react';
import { ReactNode, useMemo } from 'react';
import { ITheme } from '@legacy';
import { IMapOverlayPosition } from '../modules/interfaces';
import { getMapOverlayStyles } from './styles';

/** Axis the chrome in one corner runs along. */
export type IMapOverlayDirection = 'row' | 'column';

export interface IMapOverlayProps {
    position: IMapOverlayPosition;
    /** How the chrome in this corner is laid out. Defaults to a stack. */
    direction?: IMapOverlayDirection;
    theme: ITheme;
    children: ReactNode;
}

/**
 * Anchors the control's chrome - the search box, the status message, the legend - over whichever provider is
 * drawing, so none of them needs to know how a given map positions things.
 *
 * Only the chrome itself takes pointer events, so the empty space around it still pans the map.
 */
export const MapOverlay = (props: IMapOverlayProps) => {
    const direction = props.direction ?? 'column';
    const styles = useMemo(
        () => getMapOverlayStyles(props.theme, props.position, direction),
        [props.theme, props.position, direction]);

    if (!props.children) {
        return null;
    }

    return (
        <ThemeProvider theme={props.theme} applyTo='none' className={styles.root}>
            {props.children}
        </ThemeProvider>
    );
};
