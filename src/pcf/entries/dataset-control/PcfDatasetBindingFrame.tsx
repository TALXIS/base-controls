import React from 'react';
import { initializeIcons } from '@fluentui/react';
import { FetchXmlDataProvider, IDataProvider } from '@talxis/client-libraries';
import { DatasetControl, IDatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@controls/dataset-control';
import { createIsolatedComponent, IIsolatedComponentProps } from '@controls/isolated-frame';
import { StateProvider } from '@core';
import { Labels, LabelsProvider } from '@labels';
import { PcfContextProvider, usePcfContext } from '@pcf';
import { AppThemeProvider } from '@theme';
import type { IPcfDatasetControlConfig, IPcfDatasetControlView } from './PcfBindingEntryShared';
import { addColumnDefinitions, applyMetadata, IPcfBindingFrameProps, showColumn, UnsavedRecordMessage } from './PcfBindingFrameShared';

/** What the dataset binding entry hands its frame. */
export interface IPcfDatasetBindingFrameProps<TData = unknown> extends IPcfBindingFrameProps<TData> {
    enablePagination: boolean;
    enablePageSizeSwitcher: boolean;
    /** Shows a message instead of the control while the form's record is not saved yet. */
    isUnsavedRecord?: boolean;
    /** Fires when a mount creates its provider, before it loads. */
    onProviderCreated: (provider: IDataProvider) => void;
}

export type PcfDatasetBindingFrameHost<TData = unknown> = React.ComponentType<IPcfDatasetBindingFrameProps<TData> & IIsolatedComponentProps>;

/**
 * Declares the frame a data-set-bound PCF renders its dataset control in; call it at module level.
 *
 * @param key Unique within the bundle.
 * @param Body Draws the records inside `DatasetControl.Body`, such as a `ClientSideGrid`.
 */
export const createPcfDatasetBindingFrame = <TData = unknown,>(key: string, Body: React.ComponentType): PcfDatasetBindingFrameHost<TData> =>
    createIsolatedComponent<IPcfDatasetBindingFrameProps<TData>>(key, props => <PcfDatasetBindingFrame {...props}><Body /></PcfDatasetBindingFrame>, {
        prepareWindow: frameWindow => Object.assign(frameWindow, { Xrm: (window as Window & { Xrm?: unknown }).Xrm }),
    });

let areIconsInitialized = false;

const NO_LABELS: Labels = {};

const PcfDatasetBindingFrame = <TData,>(props: IPcfDatasetBindingFrameProps<TData> & { children: React.ReactNode }) => {
    if (!areIconsInitialized) {
        initializeIcons();
        areIconsInitialized = true;
    }
    return <PcfContextProvider context={props.context}>
        <StateProvider store={props.stateStore}>
            <AppThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <LabelsProvider labels={props.labels ?? NO_LABELS}>
                    {props.isUnsavedRecord ? <UnsavedRecordMessage /> : <PcfDatasetBindingDatasetControl {...props} />}
                </LabelsProvider>
            </AppThemeProvider>
        </StateProvider>
    </PcfContextProvider>;
};

//the frame runs its own copy of the libraries, so the provider has to be created in it
const PcfDatasetBindingDatasetControl = <TData,>(props: IPcfDatasetBindingFrameProps<TData> & { children: React.ReactNode }) => {
    const { formatting } = usePcfContext();

    const onLoad = async (control: IDatasetControl<TData>): Promise<IDatasetControlLoadResult<TData>> => {
        const { views = [], metadata } = await props.onLoadConfig(control);
        const provider = new FetchXmlDataProvider({ fetchXml: '', formatting });
        props.onProviderCreated(provider);
        return { provider, views: views.map(view => toView(view, metadata)) };
    };

    //the host draws the view switcher, quick find, column editing and commands above it
    return <DatasetControl onLoad={onLoad} height={props.height} stateKey="datasetControl">
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

//the host's columns come in the host's order
const toView = <TData,>(view: IPcfDatasetControlView<TData>, metadata: IPcfDatasetControlConfig['metadata']): IDatasetControlView<TData> => ({
    id: view.id,
    name: view.name,
    resolve: async provider => {
        addColumnDefinitions(provider, view.columns ?? []);
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
