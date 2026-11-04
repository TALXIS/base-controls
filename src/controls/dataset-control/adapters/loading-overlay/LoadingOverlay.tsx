import { useEventEmitter, useRerender } from "@core";
import { ILoadingOverlayComponents, LoadingOverlay as LoadingOverlayUi } from "@ui/loading";
import { useRegisterDatasetControlPart } from "../root/useRegisterDatasetControlPart";
import { DatasetControlLoadingOverlay, IDatasetControlLoadingOverlayEvents } from "../../runtime/parts/loading-overlay/DatasetControlLoadingOverlay";

export interface ILoadingOverlayProps {
    children?: React.ReactNode;
    components?: Partial<ILoadingOverlayComponents>;
}

/** What it wraps, covered while the `loadingOverlay` part is set loading. */
export const LoadingOverlay = (props: ILoadingOverlayProps) => {
    const loadingOverlay = useRegisterDatasetControlPart('loadingOverlay', () => new DatasetControlLoadingOverlay());
    const { rerender } = useRerender();
    useEventEmitter<IDatasetControlLoadingOverlayEvents>(loadingOverlay.events, 'onLoadingChanged', rerender);

    return <LoadingOverlayUi isLoading={loadingOverlay.isLoading()} message={loadingOverlay.getMessage()} components={props.components}>
        {props.children}
    </LoadingOverlayUi>;
};
