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
            provider: createProvider(props.providerKind, metadata, formatting),
            views: views.map(view => toView(view, views, props.providerKind)),
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

const toView = <TData,>(view: IPcfDatasetControlView<TData>, views: IPcfDatasetControlView<TData>[], kind: PcfDatasetControlProviderKind): IDatasetControlView<TData> => ({
    id: view.id,
    name: view.name,
    group: view.group,
    resolve: async provider => {
        //every mount creates its provider, so it describes the columns as the open view does
        addViewColumns(provider, kind, view, views);
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

const createProvider = (kind: PcfDatasetControlProviderKind, metadata: IPcfDatasetControlConfig['metadata'], formatting: IFormatting): IDataProvider => {
    if (kind === 'FetchXml') {
        const provider = new FetchXmlDataProvider({ fetchXml: '', formatting });
        if (metadata) {
            provider.setMetadata(metadata);
        }
        return provider;
    }
    return new MemoryDataProvider({ dataSource: [], metadata: { ...metadata } as IMemoryProviderEntityMetadata, formatting });
};

//the open view's definitions win, then the other views add what the provider lacks
const addViewColumns = <TData,>(provider: IDataProvider, kind: PcfDatasetControlProviderKind, view: IPcfDatasetControlView<TData>, views: IPcfDatasetControlView<TData>[]): void => {
    const viewColumns = [view, ...views.filter(other => other !== view)].flatMap(other => other.columns ?? []).map(toColumnDefinition);
    //Dataverse knows the rest
    const addable = kind === 'FetchXml' ? viewColumns.filter(column => column.isVirtual) : viewColumns;
    const definitions = new Map((view.columns ?? []).map(column => [column.name, toColumnDefinition(column)]));
    provider.hooks.availableColumns.add((columns, options) => {
        if (options?.entityName) {
            return;
        }
        columns.forEach((column, index) => {
            const definition = definitions.get(column.name);
            if (definition) {
                columns[index] = { ...column, ...definition, metadata: { ...column.metadata, ...definition.metadata } as IColumn['metadata'] };
            }
        });
        for (const column of addable) {
            if (!columns.some(existing => existing.name === column.name)) {
                columns.push(column);
            }
        }
    });
};

//where and how a view shows the column is the view's own
const toColumnDefinition = ({ isHidden, order, grouping, aggregation, ...definition }: IDatasetControlViewColumn): IColumn => definition as IColumn;
