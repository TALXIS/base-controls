import { ReactNode, RefObject } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useKeepCardInView } from './useKeepCardInView';

export interface IGoogleMapsCardProps {
    /** The provider's outermost element, which the card must stay inside of. */
    containerRef: RefObject<HTMLElement>;
    className: string;
    maxHeight: number;
    children: ReactNode;
}

/**
 * The element a card is drawn in inside Google's InfoWindow: capped to the map's height and kept in view as
 * it grows. Its own component because `useMap` needs the map's context, which the provider itself sits above.
 */
export const GoogleMapsCard = (props: IGoogleMapsCardProps) => {
    const map = useMap();
    const setCardElement = useKeepCardInView(map, props.containerRef);
    return <div ref={setCardElement} className={props.className} style={{ maxHeight: props.maxHeight }}>{props.children}</div>;
};
