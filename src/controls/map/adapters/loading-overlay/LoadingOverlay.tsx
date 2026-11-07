import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { ILoadingOverlayComponents, LoadingOverlay as LoadingOverlayUi } from "@ui/loading";
import { useMap } from "../../context";
import { MAP_LABELS } from "../../labels";

export interface ILoadingOverlayProps {
    components?: Partial<ILoadingOverlayComponents>;
}

/** Covers the map while its provider loads. */
export const LoadingOverlay = (props: ILoadingOverlayProps) => {
    const provider = useMap().services.get('provider');
    const labels = useLabels(MAP_LABELS);
    const { rerender } = useRerender();
    useEventEmitter<IDataProviderEventListeners>(provider, 'onLoading', rerender);

    return <LoadingOverlayUi isLoading={provider.isLoading()} message={labels.get('map.loadingMessage')} components={props.components} />;
};
