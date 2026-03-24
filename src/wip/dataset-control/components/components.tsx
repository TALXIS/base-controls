import { ILoadingPlaceholderProps, LoadingPlaceholder } from "../../loading-placeholder";

export interface IDatasetControlComponents {
    LoadingPlaceholder: (props: ILoadingPlaceholderProps) => JSX.Element;
}

export const components: IDatasetControlComponents = {
    LoadingPlaceholder: LoadingPlaceholder
}