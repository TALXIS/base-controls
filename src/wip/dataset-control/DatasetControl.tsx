import { useEffect, useMemo, useRef } from "react";
import { EditColumnsContext } from "../edit-columns";
import { QuickFindContext } from "../quick-find";
import { ViewSwitcherContext } from "../view-switcher";
import { IDatasetControlEvents, ISimpleDatasetControl, SimpleDatasetControl } from "../../utils/dataset-control";
import { IDatasetControlComponents } from "./components/components";
import { components as defaultComponents } from "./components";
import { useEventEmitter } from "../../hooks";
import { IDataProvider, IDataProviderEventListeners } from "@talxis/client-libraries";
import { Skeleton } from "./components/skeleton";
import { useShouldRemount } from "../../hooks/useShouldRemount";
import { DatasetControlContext } from "./context";

export interface IDatasetControlFactory {
    /**
     * This method should return the class (not an instance) of the data provider that will be used by the dataset control. The dataset control will instantiate the provider by itself, passing the options returned from `getDataProviderOptions` to the provider's constructor.
     */
    getDataProviderClass: () => new (...args: any[]) => IDataProvider;
    /**
     * This object will be passed into the provider's constructor when instantiating the provider. It can be used to pass any additional configuration or dependencies that the provider might need.
     */
    getDataProviderOptions: () => { [key: string]: any };

    /**
     * Pass state
     */
    getState: () => any;
}

interface IDatasetControlProps {
    factory: IDatasetControlFactory;
    children?: React.ReactNode;
    components?: Partial<IDatasetControlComponents>;
}

interface IInternalDatasetControlProps extends IDatasetControlProps {
    datasetControl: ISimpleDatasetControl;
    onRemountRequested: () => void;
}


//this handles the lifecycle of the dataset control, including remounting when requested by the control. The actual rendering of the control is done in the InternalDatasetControl component, which is remounted whenever a remount is requested.
export const DatasetControl = (props: IDatasetControlProps) => {
    const { factory } = props;
    const datasetControlRef = useRef<ISimpleDatasetControl>();
    const [shouldRemount, remount] = useShouldRemount();

    if (!datasetControlRef.current) {
        datasetControlRef.current = new SimpleDatasetControl(factory);
    }

    const onRemountRequested = () => {
        datasetControlRef.current?.destroy();
        datasetControlRef.current = undefined;
        remount();
    }

    useEffect(() => {
        return () => {
            datasetControlRef.current?.destroy();
        }
    }, []);

    if (!shouldRemount) {
        return <IntenalDatasetControl
            {...props}
            datasetControl={datasetControlRef.current}
            onRemountRequested={onRemountRequested}
        />
    }
    else {
        return <></>
    }

}

const IntenalDatasetControl = (props: IInternalDatasetControlProps) => {
    const resolveFirstLoad = useRef<() => void>(() => { });
    const firstLoadPromise = useMemo(() => new Promise<void>((resolve) => {
        resolveFirstLoad.current = resolve;
    }), []);
    const datasetControl = props.datasetControl;
    const provider = datasetControl.getDataset().getDataProvider();
    const components = { ...defaultComponents, ...props.components };
    useEventEmitter<IDataProviderEventListeners>(provider, 'onNewDataLoaded', (params: any) => onNewDataLoaded(params));
    useEventEmitter<IDatasetControlEvents>(datasetControl, 'onRemountRequested', () => props.onRemountRequested());
    useEventEmitter<IDataProviderEventListeners>(provider, 'onError', (error: any, errorMessage: any) => onError(error, errorMessage))

    useEffect(() => {
        datasetControl.refresh();
    }, []);

    const onNewDataLoaded = (params: any) => {
        const { isFirstLoad } = params;
        if (isFirstLoad) {
            resolveFirstLoad.current();
        }
    }

    const onError = (error: any, errorMessage: any) => {
        console.log(error, errorMessage);
        resolveFirstLoad.current();
    }

    return <DatasetControlContext.Provider value={datasetControl}>
        <ViewSwitcherContext.Provider value={datasetControl.viewSwitcher}>
            <EditColumnsContext.Provider value={datasetControl.editColumns}>
                <QuickFindContext.Provider value={datasetControl.quickFind}>
                    <components.LoadingPlaceholder
                        loadingPromise={firstLoadPromise}
                        components={{
                            Spinner: Skeleton
                        }}
                    >
                        {props.children}
                        <button onClick={() => datasetControl.requestRemount()}>remount</button>
                    </components.LoadingPlaceholder>
                </QuickFindContext.Provider>
            </EditColumnsContext.Provider>
        </ViewSwitcherContext.Provider>
    </DatasetControlContext.Provider>

}

