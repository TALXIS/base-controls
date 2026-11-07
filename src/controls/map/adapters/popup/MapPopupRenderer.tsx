import { IMapPopupRendererComponents } from "./components";
import { MapPopupCard } from "./MapPopupCard";
import { MapPopupHeader } from "./MapPopupHeader";

export interface IMapPopupRendererProps {
    components?: IMapPopupRendererComponents;
}

/** The default popup: the record's name. */
export const MapPopupRenderer = (props: IMapPopupRendererProps) => {
    const components = props.components ?? {};
    return <MapPopupCard components={components.card}>
        <MapPopupHeader components={components.header} />
    </MapPopupCard>;
};
