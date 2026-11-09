import { useCallback, useMemo } from 'react';
import { IMapPinAppearance } from '../core/pinAppearance';
import { IMapLocation } from './provider';

/** Stroke width, in pixels, of the line connecting the pins of a route. */
export const ROUTE_STROKE_WEIGHT = 4;

/** Width and height, in pixels, of a pin standing for a single record. */
export const PIN_WIDTH = 24;
export const PIN_HEIGHT = 32;

/** Diameter, in pixels, of the smallest and largest pin standing for a group. */
const CLUSTER_MIN_SIZE = 32;
const CLUSTER_MAX_SIZE = 56;

/** Group size at which a cluster pin stops growing, so one huge group does not dwarf the map. */
const CLUSTER_SIZE_CEILING = 1000;

const UNSELECTED_PIN_OPACITY = 0.45;

/** Diameter of the pin standing for a group, grown with the group so a dense area reads at a glance. */
export const getClusterPinSize = (count: number): number => {
    const scale = Math.min(1, Math.log10(Math.max(count, 1)) / Math.log10(CLUSTER_SIZE_CEILING));
    return Math.round(CLUSTER_MIN_SIZE + (CLUSTER_MAX_SIZE - CLUSTER_MIN_SIZE) * scale);
};

/** Shortens a group size to what fits inside a pin: the raw count, or a rounded form once it runs to four digits. */
export const getClusterPinLabel = (count: number): string => {
    if (count < 1000) {
        return `${count}`;
    }
    if (count < 10000) {
        return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${Math.round(count / 1000)}k`;
};

/** The SVG a pin standing for a single record is drawn from, sized `PIN_WIDTH` by `PIN_HEIGHT`. */
export const getPinSvg = (color: string): string =>
    `<svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0a12 12 0 0 0-12 12c0 8.5 12 20 12 20s12-11.5 12-20A12 12 0 0 0 12 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
    </svg>`;

/** Wraps markup as a data url, so an `<img>` or a marker can draw it without an image asset. */
export const toSvgDataUrl = (svg: string): string => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

/** The SVG a pin standing for a group is drawn from, carrying the record count and sized by `getClusterPinSize`. */
export const getClusterPinSvg = (count: number, color: string, textColor: string): string => {
    const size = getClusterPinSize(count);
    const label = getClusterPinLabel(count);
    const fontSize = size <= 36 ? 12 : size <= 46 ? 14 : 16;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}" opacity="0.25" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
              font-family="Segoe UI, system-ui, sans-serif" font-size="${fontSize}" font-weight="600"
              fill="${textColor}">${label}</text>
    </svg>`;
};

/**
 * How visible a pin is, given what the dataset has selected.
 *
 * Nothing selected reads as everything selected, so an unfiltered dataset is not a dimmed map. A pin
 * standing for a group is never dimmed either - it may well contain the selection.
 */
export const getPinOpacity = (location: IMapLocation, selectedIds: Set<string>): number =>
    location.cluster || selectedIds.size === 0 || selectedIds.has(location.id) ? 1 : UNSELECTED_PIN_OPACITY;

/**
 * Whether the dataset's selection is exactly the record an open card was opened for - what a plain click on
 * a pin selects along with opening the card. Closing that card drops the selection again, so the pins it
 * dimmed come back; a selection built with ctrl/cmd+click, or a group's card (never a record), is left alone.
 */
export const isSelectionOfCard = (openLocationId: string | undefined, selectedIds: readonly string[]): boolean =>
    !!openLocationId && selectedIds.length === 1 && selectedIds[0] === openLocationId;

/** Turns the dataset selection into pin styling, so every provider dims the pins outside it identically. */
export const useMapPinSelection = (selectedLocationIds: string[]) => {
    const selectedIds = useMemo(() => new Set(selectedLocationIds), [selectedLocationIds]);
    const isSelected = useCallback((location: IMapLocation) => selectedIds.has(location.id), [selectedIds]);
    const getOpacity = useCallback((location: IMapLocation) => getPinOpacity(location, selectedIds), [selectedIds]);

    return { isSelected, getOpacity };
};

/** Size a pin is drawn at, taking whatever its appearance asked for and falling back to the shipped size. */
export interface IMapPinSize {
    width: number;
    height: number;
}

/** The size a pin is drawn at. */
export const getPinSize = (appearance?: IMapPinAppearance, fallback: IMapPinSize = { width: PIN_WIDTH, height: PIN_HEIGHT }): IMapPinSize => ({
    width: appearance?.width ?? fallback.width,
    height: appearance?.height ?? fallback.height
});

/**
 * Where a pin is anchored on its position: the appearance's own `anchor` wins; without one, an image or
 * custom markup is centred on it and the shipped shape points at it with its tip.
 */
export const getPinAnchor = (location: IMapLocation, size: IMapPinSize): { x: number; y: number } => {
    const centered = location.pin?.anchor
        ? location.pin.anchor === 'center'
        : !!(location.pin?.svg || location.pin?.url);
    return { x: size.width / 2, y: centered ? size.height / 2 : size.height };
};

/**
 * The markup a pin is drawn from. Custom markup wins over an image, an image over a colour, and a colour
 * over the theme, in order of how specific each is about the record. Returns `undefined` when the pin is an
 * image, which the caller should draw instead.
 */
export const getPinMarkup = (appearance: IMapPinAppearance | undefined, defaultColor: string): string | undefined => {
    if (appearance?.svg) {
        return appearance.svg;
    }
    if (appearance?.url) {
        return undefined;
    }
    return getPinSvg(appearance?.color ?? defaultColor);
};

//the url can come from a maker-typed rule, so it must not be able to break out of the attribute
const escapeAttribute = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** A pin image as markup, so a renderer that only takes HTML can draw one. */
export const getPinImageMarkup = (url: string, size: IMapPinSize): string =>
    `<img src="${escapeAttribute(url)}" width="${size.width}" height="${size.height}" alt="" style="display:block" />`;
