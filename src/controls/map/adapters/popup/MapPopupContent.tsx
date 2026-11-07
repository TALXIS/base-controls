import { IMapPopupComponents } from "./components";
import { MapPopupRenderer } from "./MapPopupRenderer";

export interface IMapPopupContentProps {
    components?: IMapPopupComponents;
}

/** What a pin's popup shows: `onRender`'s content, or the default popup. */
export const MapPopupContent = (props: IMapPopupContentProps) => {
    const { onRender, card, header } = props.components ?? {};
    return onRender ? onRender() : <MapPopupRenderer components={{ card, header }} />;
};
