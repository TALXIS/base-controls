import { useMemo } from 'react';
import { ITheme } from '@legacy';
import { IMapPinAppearance } from '../core/pinAppearance';
import { getPinSvg, toSvgDataUrl } from '../providers/pinStyle';
import { getMapPinSwatchStyles } from './styles';

export interface IMapPinSwatchProps {
    /** The pin to draw small. Absent draws the shipped pin in the theme's primary colour, as the map does. */
    pin?: IMapPinAppearance;
    theme: ITheme;
    /** Height in pixels; the width follows the pin's proportions. */
    size?: number;
}

/** Height a swatch is drawn at when nothing says otherwise - one line of small text. */
const DEFAULT_SWATCH_SIZE = 20;

/**
 * A pin at text size, drawn from the same appearance the map draws it from - so a list next to the map
 * reads its rows the way the pins read.
 */
export const MapPinSwatch = (props: IMapPinSwatchProps) => {
    const { pin, theme, size = DEFAULT_SWATCH_SIZE } = props;
    const styles = useMemo(() => getMapPinSwatchStyles(), []);
    const src = pin?.svg
        ? toSvgDataUrl(pin.svg)
        : pin?.url ?? toSvgDataUrl(getPinSvg(pin?.color ?? theme.palette.themePrimary));
    const width = pin?.width && pin?.height ? Math.round(size * pin.width / pin.height) : undefined;

    return <img className={styles.root} src={src} alt="" aria-hidden="true" style={{ height: size, width }} />;
};
