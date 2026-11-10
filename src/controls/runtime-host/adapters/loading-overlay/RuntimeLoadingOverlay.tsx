import { IRuntime, IRuntimeLoadingEvents, useEventEmitter, useRerender } from "@core";
import { ILoadingOverlayComponents, LoadingOverlay } from "@ui/loading";
import { useRuntime } from "../../context";

export interface IRuntimeLoadingOverlayProps {
    components?: Partial<ILoadingOverlayComponents>;
}

/** Covers the runtime's box while its loading is shown. */
export const RuntimeLoadingOverlay = (props: IRuntimeLoadingOverlayProps) => {
    const { loading } = useRuntime<IRuntime>();
    const { rerender } = useRerender();
    useEventEmitter<IRuntimeLoadingEvents>(loading.events, 'onLoadingChanged', rerender);
    return <LoadingOverlay isLoading={loading.isLoading()} message={loading.getMessage()} components={props.components} />;
};
