import React from 'react';
import { initializeIcons } from '@fluentui/react';
import { FetchXmlDataProvider, IColumn, IDataProvider, IFormatting, IMemoryProviderEntityMetadata, MemoryDataProvider } from '@talxis/client-libraries';
import { DatasetControl, IDatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import { createIsolatedComponent, IIsolatedComponentProps } from '@controls/isolated-frame';
import { StateProvider } from '@core';
import { PcfContextProvider, usePcfContext } from '@pcf';
import { AppThemeProvider, ITheme } from '@theme';
import type { IPcfDatasetControlConfig, IPcfDatasetControlParts, IPcfDatasetControlView, PcfDatasetControlProviderKind } from './PcfDatasetControlEntry';

/** What the entry hands the frame. */
export interface IPcfDatasetControlFrameProps<TData = unknown> {
    context: ComponentFramework.Context<any>;
    theme: ITheme;
    height?: string;
    providerKind: PcfDatasetControlProviderKind;
    parts: IPcfDatasetControlParts;
    onLoadConfig: (control: IDatasetControl<TData>) => Promise<IPcfDatasetControlConfig<TData>>;
}

export interface IPcfDatasetControlFrameContentProps<TData = unknown> extends IPcfDatasetControlFrameProps<TData> {
    /** What the body draws the records with, such as a `ClientSideGrid`. */
    children?: React.ReactNode;
}

export type PcfDatasetControlFrameHost<TData = unknown> = React.ComponentType<IPcfDatasetControlFrameProps<TData> & IIsolatedComponentProps>;

let areIconsInitialized = false;

/** The dataset control drawn inside the frame, with the PCF's body as its children. */
export const PcfDatasetControlFrame = <TData,>(props: IPcfDatasetControlFrameContentProps<TData>) => {
    if (!areIconsInitialized) {
        initializeIcons();
        areIconsInitialized = true;
    }
    return <PcfContextProvider context={props.context}>
        <StateProvider>
            <AppThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <PcfDatasetControl {...props} />
            </AppThemeProvider>
        </StateProvider>
    </PcfContextProvider>;
};

/**
 * Declares the frame a PCF renders its dataset control in; call it at module level so the frame's copy of the bundle defines it too.
 *
 * @param key Unique within the bundle.
 * @param Body Draws the records inside `DatasetControl.Body`, such as a `ClientSideGrid`.
 */
export const createPcfDatasetControlFrame = <TData = unknown,>(key: string, Body: React.ComponentType): PcfDatasetControlFrameHost<TData> =>
    createIsolatedComponent<IPcfDatasetControlFrameProps<TData>>(key, props => <PcfDatasetControlFrame {...props}><Body /></PcfDatasetControlFrame>, {
        prepareWindow: frameWindow => Object.assign(frameWindow, { Xrm: (window as Window & { Xrm?: unknown }).Xrm }),
    });

//the frame runs its own copy of the libraries, so the provider has to be created in it
const PcfDatasetControl = <TData,>(props: IPcfDatasetControlFrameContentProps<TData>) => {
    const { formatting } = usePcfContext();
    const { parts } = props;

    const onLoad = async (control: IDatasetControl<TData>): Promise<IDatasetControlLoadResult<TData>> => {
        const { views = [], metadata } = await props.onLoadConfig(control);
        return {
            provider: createProvider(props.providerKind, views, metadata, formatting),
            views: views.map(toView),
        };
    };

    return <DatasetControl onLoad={onLoad} height={props.height}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                {parts.enableViewSwitcher && <DatasetControl.ViewSwitcher />}
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                {parts.enableCommandBar && <DatasetControl.Ribbon enableRefresh />}
                {parts.enableEditColumns && <DatasetControl.EditColumns />}
                {parts.enableQuickFind && <DatasetControl.QuickFind />}
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Notifications />
        <DatasetControl.Body>
            {props.children}
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                {parts.enablePageSizeSwitcher && <DatasetControl.PageSizeSwitcher />}
            </DatasetControl.Footer.Start>
            <DatasetControl.Footer.End>
                {parts.enablePagination && <DatasetControl.Pagination />}
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>;
};

const toView = <TData,>(view: IPcfDatasetControlView<TData>): IDatasetControlView<TData> => ({
    id: view.id,
    name: view.name,
    group: view.group,
    resolve: async provider => {
        provider.setDataSource(view.dataSource);
        //with no columns set, the preload takes them from the saved query's layout or the fetchXml
        await provider.preload();
        const columns = new Map<string, IDatasetControlViewColumn>(provider.getColumns().map(column => [column.name, column]));
        //the fetchXml's own attributes load hidden
        for (const column of view.columns ?? []) {
            columns.set(column.name, { ...columns.get(column.name), isHidden: false, ...column });
        }
        return { columns: [...columns.values()], data: view.data, control: view.control };
    },
});

const createProvider = <TData,>(kind: PcfDatasetControlProviderKind, views: IPcfDatasetControlView<TData>[], metadata: IPcfDatasetControlConfig['metadata'], formatting: IFormatting): IDataProvider => {
    const viewColumns = views.flatMap(view => view.columns ?? []) as IColumn[];
    if (kind === 'FetchXml') {
        const provider = new FetchXmlDataProvider({ fetchXml: '', formatting });
        if (metadata) {
            provider.setMetadata(metadata);
        }
        //Dataverse knows the rest
        addAvailableColumns(provider, viewColumns.filter(column => column.isVirtual));
        return provider;
    }
    const provider = new MemoryDataProvider({ dataSource: [], metadata: { ...metadata } as IMemoryProviderEntityMetadata, formatting });
    addAvailableColumns(provider, viewColumns);
    return provider;
};

const addAvailableColumns = (provider: IDataProvider, added: IColumn[]): void => {
    provider.hooks.availableColumns.add((columns, options) => {
        if (options?.entityName) {
            return;
        }
        for (const column of added) {
            if (!columns.some(existing => existing.name === column.name)) {
                columns.push(column);
            }
        }
    });
};
