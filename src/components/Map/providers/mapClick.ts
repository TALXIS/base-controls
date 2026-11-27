/**
 * Whether a click that reached the map was really a click on the map.
 *
 * Anything the control draws over the map - a card, its buttons - lives inside the map's own element, and a
 * map library only recognizes it as chrome by walking the target's ancestors. A button that removes itself as
 * it is pressed (a card's Delete) is already detached by the time the click bubbles, so the map sees a click
 * it cannot attribute and would wrongly create a record from it.
 */
export const isMapSurfaceClick = (target: EventTarget | null | undefined): boolean => {
    const node = target as Node | null | undefined;
    if (!node || typeof (node as Node).isConnected !== 'boolean') {
        return true;
    }
    return node.isConnected;
};
