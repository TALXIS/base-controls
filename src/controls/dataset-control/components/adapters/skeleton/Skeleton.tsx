import { ILoadingBoundaryComponents, LoadingBoundary } from "@ui/loading-boundary";
import { DatasetControlUi } from "../../ui";
import { ISkeletonComponents } from "./components";
import { useRequiredDatasetControlRuntime } from "../root/context";

export interface ISkeletonProps {
    children?: React.ReactNode;
    components?: ISkeletonComponents;
}

/** Shows the placeholder while the control loads, the first time and on every reload, then what it wraps. */
export const Skeleton = (props: ISkeletonProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const { loadingBoundary, ...skeleton } = props.components ?? {};

    const loadingBoundaryComponents: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <DatasetControlUi.Skeleton height={runtime.getHeight()} components={skeleton} />,
        ...loadingBoundary,
    };

    return <LoadingBoundary isLoading={runtime.isLoading() || !runtime.getProvider()} components={loadingBoundaryComponents}>
        {props.children}
    </LoadingBoundary>;
};
