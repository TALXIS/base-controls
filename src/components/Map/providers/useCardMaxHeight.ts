import { RefObject, useEffect, useState } from 'react';
import { CARD_MAX_HEIGHT } from './layout';

/**
 * Room a popup needs around its card before the card itself gets any: the pin it points at, the popup's tip,
 * its own padding and close button, and a margin to the map's edge.
 */
const CARD_CHROME_RESERVE = 140;

/** Below this a card is a slit; a map that small gets a slit that scrolls rather than a card that overflows. */
const CARD_MIN_HEIGHT = 160;

/**
 * The tallest a card may be on the map drawn in `containerRef`: `CARD_MAX_HEIGHT`, or less on a map too short
 * for that. A card taller than the map cannot be panned into view - its header, the way back to a list and
 * the close button end up above the map - so the cap follows the map's own height and is re-read as it resizes.
 */
export const useCardMaxHeight = (containerRef: RefObject<HTMLElement>): number => {
    const [mapHeight, setMapHeight] = useState<number>();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const read = () => setMapHeight(container.clientHeight);
        read();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(read);
        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef]);

    return getCardMaxHeight(mapHeight);
};

/** The cap for a map of the given height; the full `CARD_MAX_HEIGHT` while the height is not known yet. */
export const getCardMaxHeight = (mapHeight: number | undefined): number => {
    if (!mapHeight) {
        return CARD_MAX_HEIGHT;
    }
    return Math.max(CARD_MIN_HEIGHT, Math.min(CARD_MAX_HEIGHT, mapHeight - CARD_CHROME_RESERVE));
};
