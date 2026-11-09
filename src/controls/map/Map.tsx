import { useLatest } from "@core";
import { useDataProvider } from "@data";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IMapProps } from "./interfaces";
import { MapRuntime } from "./runtime/MapRuntime";
import { MapContext } from "./context";
import { MapUiContainer } from "./ui";
import { LoadingOverlay } from "./adapters/loading-overlay";

/** Shows the records of the provider around it as pins, drawn by its library module. */
export const MapRoot = (props: IMapProps) => {
    const provider = useDataProvider();
    const propsRef = useLatest(props);
    const createRuntime = () => new MapRuntime({ provider, getProps: () => propsRef.current });

    return <RuntimeHost<MapRuntime> createRuntime={createRuntime} onSetup={map => propsRef.current.onSetup?.(map)} components={{ loading: props.components?.loading, errorMessage: props.components?.errorMessage }}>
        <MapMount {...props} />
    </RuntimeHost>;
};

const MapMount = (props: IMapProps) => {
    const runtime = useRuntime<MapRuntime>();
    const { loading, errorMessage, loadingOverlay, ...containerComponents } = props.components ?? {};

    return <MapContext.Provider value={runtime}>
        <MapUiContainer height={props.height} className={props.className} components={containerComponents}>
            {props.children}
            <LoadingOverlay components={loadingOverlay} />
        </MapUiContainer>
    </MapContext.Provider>;
};
