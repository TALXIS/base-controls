import { RefObject, useCallback, useEffect, useRef } from 'react';

/** Distance a card keeps from the map's edge once panned into view. */
const EDGE_MARGIN = 8;

/** Rectangle edges the shift is worked out from - what `getBoundingClientRect` gives, kept minimal for tests. */
export interface IEdges {
    top: number;
    bottom: number;
}

/**
 * How far the map's centre must move, in pixels, for a popup to sit inside the map: negative when the popup
 * pokes out above (the centre moves up, the popup comes down), positive when it pokes out below, `0` when it
 * fits. A popup taller than the map is aligned to the top, so its header and close button are the part shown.
 */
export const getCardShift = (popup: IEdges, container: IEdges): number => {
    const overflowTop = popup.top - (container.top + EDGE_MARGIN);
    if (overflowTop < 0) {
        return overflowTop;
    }
    const overflowBottom = popup.bottom - (container.bottom - EDGE_MARGIN);
    return overflowBottom > 0 ? Math.min(overflowBottom, overflowTop) : 0;
};

const keepInView = (map: google.maps.Map | null, card: HTMLElement, container: HTMLElement | null) => {
    if (!map || !container) {
        return;
    }
    //the bubble Google draws around the content, so its padding and close button count as well
    const popup = card.closest('.gm-style-iw') ?? card;
    const popupRect = popup.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    if (!popupRect.height || !containerRect.height) {
        return;
    }
    const shift = getCardShift(popupRect, containerRect);
    if (shift) {
        map.panBy(0, shift);
    }
};

/**
 * Pans the map so the card stays inside it as its size changes. Returns the ref to put on the card element.
 *
 * Google pans an InfoWindow into view only when it opens. A card that grows afterwards - a group's list
 * becoming one member's card - grows upward from the pin it is anchored to, and on a pin high up the map its
 * header and close button end up above the map's edge with nothing to bring them back. Leaflet re-pans its
 * popup on every content change; this gives Google's the same behaviour, watching the card's own size.
 *
 * A callback ref rather than an effect, because the InfoWindow renders its children into a container it
 * creates after mounting - the card element only exists once that has happened.
 */
export const useKeepCardInView = (
    map: google.maps.Map | null,
    containerRef: RefObject<HTMLElement>
): ((card: HTMLElement | null) => void) => {
    const mapRef = useRef(map);
    mapRef.current = map;
    const observerRef = useRef<ResizeObserver>();

    useEffect(() => () => observerRef.current?.disconnect(), []);

    return useCallback((card: HTMLElement | null) => {
        observerRef.current?.disconnect();
        observerRef.current = undefined;
        if (!card || typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(() => keepInView(mapRef.current, card, containerRef.current));
        observer.observe(card);
        observerRef.current = observer;
    }, [containerRef]);
};
