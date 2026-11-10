import { getClassNames, useLatest } from "@core";
import { useDataProvider } from "@data";
import { IRuntimeHostUiContainerComponents, RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IMapProps } from "./interfaces";
import { MapRuntime } from "./runtime/MapRuntime";
import { MapContext } from "./context";
import { MapUiContainer } from "./ui";

/** Shows the records of the provider around it as pins, drawn by its library module. */
export const MapRoot = (props: IMapProps) => {
    const provider = useDataProvider();
    const propsRef = useLatest(props);
    const createRuntime = () => new MapRuntime({ provider, getProps: () => propsRef.current });

    const { loading, errorMessage, ...container } = props.components ?? {};
    const runtimeContainer: Partial<IRuntimeHostUiContainerComponents> = {
        onRenderContainer: containerProps => <MapUiContainer height={props.height} className={getClassNames([containerProps.className, props.className])} components={container}>
            {containerProps.children}
        </MapUiContainer>,
    };

    return <RuntimeHost<MapRuntime> createRuntime={createRuntime} onSetup={map => propsRef.current.onSetup?.(map)} components={{ container: runtimeContainer, placeholder: loading, mountError: errorMessage }}>
        <MapMount {...props} />
    </RuntimeHost>;
};

const MapMount = (props: IMapProps) => {
    const runtime = useRuntime<MapRuntime>();
    return <MapContext.Provider value={runtime}>{props.children}</MapContext.Provider>;
};
