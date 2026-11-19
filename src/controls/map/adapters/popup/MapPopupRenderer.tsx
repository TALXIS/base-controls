import { IMapPopupRendererComponents } from "./components";
import { MapPopupHeader } from "./MapPopupHeader";

export interface IMapPopupRendererProps {
    components?: IMapPopupRendererComponents;
}

/** The default popup: the record's name. */
export const MapPopupRenderer = (props: IMapPopupRendererProps) => {
    const components = props.components ?? {};
    return <MapPopupHeader components={components.header} />;
};
