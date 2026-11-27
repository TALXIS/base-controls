import React from 'react';
import { FetchXmlDataProvider, IColumn, ICommand, IDataProvider } from '@talxis/client-libraries';
import { DatasetControl, IDatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@controls/dataset-control';
import { DatasetControlState } from '@controls/dataset-control/runtime/DatasetControlState';
import { createIsolatedComponent, IIsolatedComponentProps } from '@controls/isolated-frame';
import type { IStateStore } from '@core';
import { usePcfContext } from '@pcf';
import type { IPcfBindingConfig, IPcfBindingView } from '../shared/PcfBindingEntry';
import { addColumnDefinitions, applyMetadata, IPcfBindingFrameProps, PcfBindingFrameRoot, showColumn } from '../shared/PcfBindingFrame';
import type { IPowerAppsInlineRibbonParameters } from './power-apps/PowerAppsInlineRibbon';

/** What the dataset binding entry hands its frame. */
/** The host's view as the frame resolves it. */
export interface IPcfDatasetBindingFrameConfig<TData = unknown> {
    view: IPcfBindingView<TData>;
    metadata?: IPcfBindingConfig['metadata'];
}

export interface IPcfDatasetBindingFrameProps<TData = unknown> extends IPcfBindingFrameProps {
    onLoadConfig: (control: IDatasetControl<TData>) => Promise<IPcfDatasetBindingFrameConfig<TData>>;
    enablePagination: boolean;
    enablePageSizeSwitcher: boolean;
    /** Identifies the host's query as the PCF mounted; state kept for another one comes back only in part. */
    hostQueryKey: string;
    /** Fires when a mount creates its provider, before it loads. */
    onProviderCreated: (provider: IDataProvider) => void;
    /** Asks the host for its commands on the records, as if they were selected. */
    getRecordCommands: (recordIds: string[], commandButtonIds: string[]) => Promise<ICommand[]>;
}

/** What the dataset binding frame hands the body it draws. */
export interface IPcfDatasetBindingBodyProps {
    getRecordCommands: IPowerAppsInlineRibbonParameters['getRecordCommands'];
}

const DATASET_CONTROL_STATE_KEY = 'datasetControl';
const HOST_QUERY_KEY_STATE_KEY = 'hostQueryKey';

export type PcfDatasetBindingFrameHost<TData = unknown> = React.ComponentType<IPcfDatasetBindingFrameProps<TData> & IIsolatedComponentProps>;

/**
 * Declares the frame a data-set-bound PCF renders its dataset control in; call it at module level.
 *
 * @param key Unique within the bundle.
 * @param Body Draws the records inside `DatasetControl.Body`, such as `PcfDatasetBindingGrid`.
 */
export const createPcfDatasetBindingFrame = <TData = unknown,>(key: string, Body: React.ComponentType<IPcfDatasetBindingBodyProps>): PcfDatasetBindingFrameHost<TData> =>
    createIsolatedComponent<IPcfDatasetBindingFrameProps<TData>>(key, props => <PcfBindingFrameRoot {...props}><PcfDatasetBindingDatasetControl {...props}><Body getRecordCommands={props.getRecordCommands} /></PcfDatasetBindingDatasetControl></PcfBindingFrameRoot>, {
        prepareWindow: frameWindow => Object.assign(frameWindow, { Xrm: (window as Window & { Xrm?: unknown }).Xrm }),
    });

//the frame runs its own copy of the libraries, so the provider has to be created in it
const PcfDatasetBindingDatasetControl = <TData,>(props: IPcfDatasetBindingFrameProps<TData> & { children: React.ReactNode }) => {
    const { formatting } = usePcfContext();

    const onLoad = async (control: IDatasetControl<TData>): Promise<IDatasetControlLoadResult<TData>> => {
        const { view, metadata } = await props.onLoadConfig(control);
        const provider = new FetchXmlDataProvider({ fetchXml: '', formatting });
        props.onProviderCreated(provider);
        return { provider, views: [toView(keepState(view, props.stateStore, props.hostQueryKey), metadata)] };
    };

    //the host draws the view switcher, quick find, column editing and commands above it
    return <DatasetControl onLoad={onLoad} height={props.height} stateKey={DATASET_CONTROL_STATE_KEY}>
        <DatasetControl.Notifications />
        <DatasetControl.Body>
            {props.children}
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                {props.enablePageSizeSwitcher && <DatasetControl.PageSizeSwitcher />}
            </DatasetControl.Footer.Start>
            <DatasetControl.Footer.End>
                {props.enablePagination && <DatasetControl.Pagination />}
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>;
};

//the host owns the columns and quick find, so only the user's layout of the host's columns is kept
const keepState = <TData,>(view: IPcfBindingView<TData>, stateStore: IStateStore | undefined, hostQueryKey: string): IPcfBindingView<TData> => {
    if (!stateStore) {
        return view;
    }
    const isSameHostQuery = stateStore.get<string>(HOST_QUERY_KEY_STATE_KEY) === hostQueryKey;
    stateStore.set(HOST_QUERY_KEY_STATE_KEY, hostQueryKey);
    const state = new DatasetControlState({ store: stateStore.scope(DATASET_CONTROL_STATE_KEY) });
    const kept = state.getProviderState(view.id);
    if (!kept) {
        return view;
    }
    const { columns = [], linking, searchQuery, ...query } = kept;
    //the user changed the view, columns or filters on the host since
    state.setProviderState(view.id, isSameHostQuery ? query : { pageSize: query.pageSize });
    const layouts = new Map(columns.map(column => [column.name, getColumnLayout(column)]));
    return { ...view, columns: view.columns?.map(column => ({ ...column, ...layouts.get(column.name) })) };
};

const getColumnLayout = ({ visualSizeFactor, grouping, aggregation }: IColumn): Partial<IColumn> => ({ visualSizeFactor, grouping, aggregation });

//the host's columns come in the host's order
const toView = <TData,>(view: IPcfBindingView<TData>, metadata: IPcfBindingConfig['metadata']): IDatasetControlView<TData> => ({
    id: view.id,
    name: view.name,
    resolve: async provider => {
        //Dataverse knows the rest
        addColumnDefinitions(provider, view.columns ?? [], (view.columns ?? []).filter(column => column.isVirtual));
        provider.setDataSource(view.dataSource);
        await provider.preload();
        applyMetadata(provider, metadata);
        const loadedColumns = new Map(provider.getColumns().map(column => [column.name, column]));
        const shownColumns = (view.columns ?? []).map(column => showColumn(column, loadedColumns.get(column.name)));
        const shownNames = new Set(shownColumns.map(column => column.name));
        const hiddenColumns = [...loadedColumns.values()].filter(column => !shownNames.has(column.name));
        return { columns: [...shownColumns, ...hiddenColumns], data: view.data, control: view.control };
    },
});
