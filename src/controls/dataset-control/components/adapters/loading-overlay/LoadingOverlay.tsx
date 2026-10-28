import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ILoadingOverlayComponents, LoadingOverlay as LoadingOverlayUi } from "@ui/loading";
import { useDatasetControlPart } from "../root/useDatasetControlPart";
import { DatasetControlLoadingOverlay, IDatasetControlLoadingOverlayEvents } from "./DatasetControlLoadingOverlay";

export interface ILoadingOverlayProps {
    children?: React.ReactNode;
    components?: Partial<ILoadingOverlayComponents>;
}

/** What it wraps, covered while the `loadingOverlay` part is set loading. */
export const LoadingOverlay = (props: ILoadingOverlayProps) => {
    const loadingOverlay = useDatasetControlPart('loadingOverlay', () => new DatasetControlLoadingOverlay());
    const { rerender } = useRerender();
    useEventEmitter<IDatasetControlLoadingOverlayEvents>(loadingOverlay.events, 'onLoadingChanged', rerender);

    return <LoadingOverlayUi isLoading={loadingOverlay.isLoading()} message={loadingOverlay.getMessage()} components={props.components}>
        {props.children}
    </LoadingOverlayUi>;
};
