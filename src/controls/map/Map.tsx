import { Fragment } from "react";
import { useLatest } from "@core";
import { useDataProvider } from "@data";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IMapProps } from "./interfaces";
import { MapRuntime } from "./runtime/MapRuntime";
import { MapContext } from "./context";
import { MapUiContainer } from "./ui";

/** Shows the records of the provider around it as pins, drawn by its library module. */
export const Map = (props: IMapProps) => {
    const provider = useDataProvider();
    const propsRef = useLatest(props);
    const createRuntime = () => new MapRuntime({ provider, getProps: () => propsRef.current });

    return <RuntimeHost<MapRuntime> createRuntime={createRuntime} onSetup={map => propsRef.current.onSetup?.(map)} components={{ loading: props.components?.loading, errorMessage: props.components?.errorMessage }}>
        <MapMount {...props} />
    </RuntimeHost>;
};

const MapMount = (props: IMapProps) => {
    const runtime = useRuntime<MapRuntime>();
    const { loading, errorMessage, ...containerComponents } = props.components ?? {};

    return <MapContext.Provider value={runtime}>
        <MapUiContainer className={props.className} components={containerComponents}>
            {runtime.surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
        </MapUiContainer>
    </MapContext.Provider>;
};
