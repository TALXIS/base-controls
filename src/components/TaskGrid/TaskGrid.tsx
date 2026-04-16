import { useEventEmitter } from "../../hooks/useEventEmitter"
import { IDatasetControlEvents } from "../../utils/dataset-control";
import { useRef } from "react";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./TaskGridDatasetControl";
import * as React from "react";
import { AgGridLicenseKeyContext, DatasetControlContext, LocalizationServiceContext, RootElementIdContext, TaskDataProviderContext, TaskGridComponentsContext, TaskGridDescriptorContext, usePcfContext } from "./context";
import { DatasetControl as DatasetControlRenderer } from "../DatasetControl";
import { useTheme } from "@fluentui/react";
import { getDatasetControlStyles } from "./styles";
import { Grid } from "./components/grid";
import { ITaskDataProvider } from "./data-providers/task-data-provider";
import { ITaskGridLabels, LocalizationService } from "./labels";
import { TASK_GRID_LABELS } from "./labels";
import { ITaskGridState, TaskGridDatasetControlFactory } from "./TaskGridDatasetControlFactory";
import { Header } from "./components/header/Header";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";

interface ITaskGridProps {
    taskGridDescriptor: ITaskGridDescriptor;
    labels?: Partial<ITaskGridLabels>;
    components?: Partial<ITaskGridComponents>;
}

interface IInternalTaskGridProps extends ITaskGridProps {
    datasetControl: ITaskGridDatasetControl;
    onRemountRequested: () => void;
}

//serves for keeping track of lifecycle
export const TaskGrid = (props: ITaskGridProps) => {
    const { taskGridDescriptor } = props;
    const stateRef = useRef<ITaskGridState>({});
    const components = { ...TaskGridComponents, ...props.components };
    const pcfContextRef = useRef(usePcfContext());
    pcfContextRef.current = usePcfContext();
    const labelsRef = useRef<ITaskGridLabels>();
    labelsRef.current = { ...TASK_GRID_LABELS, ...props.labels };
    const localizationService = React.useMemo(() => new LocalizationService(() => labelsRef.current!), []);

    const [instanceState, setInstanceState] = React.useState<{
        instance: ITaskGridDatasetControl;
        remountKey: number;
    } | null>(null);

    const createDatasetControlInstance = async () => {
        setInstanceState(null);
        const instance = await TaskGridDatasetControlFactory.createInstance({
            taskGridDescriptor,
            localizationService,
            state: stateRef.current,
            onGetPcfContext: () => pcfContextRef.current!,
        });
        setInstanceState(prev => ({ instance, remountKey: (prev?.remountKey ?? 0) + 1 }));
    };

    React.useEffect(() => {
        createDatasetControlInstance();
    }, []);

    if (!instanceState) {
        return components.onRenderSkeleton({
            height: taskGridDescriptor.onGetGridParameters?.().height ?? '400px'
        })
    }

    return (
        <LocalizationServiceContext.Provider value={localizationService}>
            <AgGridLicenseKeyContext.Provider value={taskGridDescriptor.onGetAgGridLicenseKey?.() ?? null}>
                <TaskGridComponentsContext.Provider value={components}>
                    <InternalTaskGridDatasetControl
                        key={instanceState.remountKey}
                        {...props}
                        datasetControl={instanceState.instance}
                        onRemountRequested={createDatasetControlInstance}
                    />
                </TaskGridComponentsContext.Provider>
            </AgGridLicenseKeyContext.Provider>
        </LocalizationServiceContext.Provider>
    );
}
const InternalTaskGridDatasetControl = (props: IInternalTaskGridProps) => {
    const { datasetControl, onRemountRequested, taskGridDescriptor } = props;
    const theme = useTheme();
    const styles = React.useMemo(() => getDatasetControlStyles(theme), [theme]);
    const provider = datasetControl.getDataset().getDataProvider() as ITaskDataProvider;
    const rootElementId = `${datasetControl.getControlId()}-root`;

    useEventEmitter<IDatasetControlEvents>(datasetControl, 'onRemountRequested', onRemountRequested);

    React.useEffect(() => {
        datasetControl.getDataset().refresh();
    }, []);

    return <DatasetControlContext.Provider value={datasetControl}>
        <TaskDataProviderContext.Provider value={provider}>
            <TaskGridDescriptorContext.Provider value={taskGridDescriptor}>
                <RootElementIdContext.Provider value={rootElementId}>
                    <DatasetControlRenderer
                        onGetDatasetControlInstance={() => datasetControl}
                        onGetControlComponent={Grid}
                        onOverrideComponentProps={(props) => {
                            return {
                                ...props,
                                onRender: (props, defaultRender) => {
                                    return defaultRender({
                                        ...props,
                                        container: {
                                            ...props.container,
                                            id: rootElementId,
                                            className: `${props.container.className} ${styles.datasetControlRoot}`
                                        },
                                        onRenderHeader: (props, defaultRender) => <Header headerProps={props} defaultRender={defaultRender} />
                                    })
                                }
                            }
                        }} />
                </RootElementIdContext.Provider>
            </TaskGridDescriptorContext.Provider>
        </TaskDataProviderContext.Provider>
    </DatasetControlContext.Provider >
}