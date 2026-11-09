import { IStyle } from "@fluentui/react";

/** Widest a card is allowed to be, so it never covers the map it is anchored on. */
export const CARD_MAX_WIDTH = 340;

/** Tallest a card popup grows before the popup itself scrolls - the one scrollbar a card gets. A shorter map lowers it, see useCardMaxHeight. */
export const CARD_MAX_HEIGHT = 420;

/**
 * How a provider fills the box the control gave it. A map has no content to be sized by, so it can never let
 * the host size it - every ancestor is a flex column allowed to shrink, and the map takes what is left. See
 * [responsive PCF](https://dev.azure.com/thenetworg/INT0015/_wiki/wikis/INT0015.wiki/4562/Responsive-PCF's).
 */
export const MAP_PROVIDER_LAYOUT: { container: IStyle; map: IStyle } = {
    /** The provider's outermost element, and the box its chrome - a provider logo, say - is positioned against. */
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        position: 'relative'
    },
    map: {
        flex: 1,
        minWidth: 0,
        minHeight: 0
    }
};
