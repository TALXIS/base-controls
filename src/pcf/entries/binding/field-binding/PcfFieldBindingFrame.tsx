import React from 'react';
import { FetchXmlDataProvider, IDataProvider, IFormatting, IMemoryProviderEntityMetadata, MemoryDataProvider } from '@talxis/client-libraries';
import { DatasetControl, IDatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import { createIsolatedComponent, IIsolatedComponentProps } from '@controls/isolated-frame';
import { usePcfContext } from '@pcf';
import type { IPcfBindingConfig, IPcfBindingView } from '../shared/PcfBindingEntry';
import { addColumnDefinitions, applyMetadata, IPcfBindingFrameProps, PcfBindingFrameRoot, showColumn } from '../shared/PcfBindingFrame';

/** The provider every view of a field-bound PCF uses. */
export type PcfFieldBindingProviderKind = 'Memory' | 'FetchXml';

/** The dataset control's parts a field-bound PCF draws. */
export interface IPcfFieldBindingParts {
    enableViewSwitcher: boolean;
    enableQuickFind: boolean;
    enableCommandBar: boolean;
    enableEditColumns: boolean;
    enablePagination: boolean;
    enablePageSizeSwitcher: boolean;
}

/** What the field binding entry hands its frame. */
export interface IPcfFieldBindingFrameProps<TData = unknown> extends IPcfBindingFrameProps {
    onLoadConfig: (control: IDatasetControl<TData>) => Promise<IPcfBindingConfig<TData>>;
    providerKind: PcfFieldBindingProviderKind;
    parts: IPcfFieldBindingParts;
}

export type PcfFieldBindingFrameHost<TData = unknown> = React.ComponentType<IPcfFieldBindingFrameProps<TData> & IIsolatedComponentProps>;

/**
 * Declares the frame a field-bound PCF renders its dataset control in; call it at module level.
 *
 * @param key Unique within the bundle.
 * @param Body Draws the records inside `DatasetControl.Body`, such as `PcfFieldBindingGrid`.
 */
export const createPcfFieldBindingFrame = <TData = unknown,>(key: string, Body: React.ComponentType): PcfFieldBindingFrameHost<TData> =>
    createIsolatedComponent<IPcfFieldBindingFrameProps<TData>>(key, props => <PcfBindingFrameRoot {...props}><PcfFieldBindingDatasetControl {...props}><Body /></PcfFieldBindingDatasetControl></PcfBindingFrameRoot>, {
        prepareWindow: frameWindow => Object.assign(frameWindow, { Xrm: (window as Window & { Xrm?: unknown }).Xrm }),
    });

//the frame runs its own copy of the libraries, so the provider has to be created in it
const PcfFieldBindingDatasetControl = <TData,>(props: IPcfFieldBindingFrameProps<TData> & { children: React.ReactNode }) => {
    const { formatting } = usePcfContext();
    const { parts } = props;

    const onLoad = async (control: IDatasetControl<TData>): Promise<IDatasetControlLoadResult<TData>> => {
        const { views = [], metadata } = await props.onLoadConfig(control);
        return {
            provider: createProvider(props.providerKind, metadata, formatting),
            views: views.map(view => toView(view, views, props.providerKind, metadata)),
        };
    };

    return <DatasetControl onLoad={onLoad} height={props.height} stateKey="datasetControl">
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

const toView = <TData,>(view: IPcfBindingView<TData>, views: IPcfBindingView<TData>[], kind: PcfFieldBindingProviderKind, metadata: IPcfBindingConfig['metadata']): IDatasetControlView<TData> => ({
    id: view.id,
    name: view.name,
    group: view.group,
    resolve: async provider => {
        //every mount creates its provider, so it describes the columns as the open view does
        addViewColumns(provider, kind, view, views);
        provider.setDataSource(view.dataSource);
        //with no columns set, the preload takes them from the saved query's layout or the fetchXml
        await provider.preload();
        if (kind === 'FetchXml') {
            applyMetadata(provider, metadata);
        }
        const columns = new Map<string, IDatasetControlViewColumn>(provider.getColumns().map(column => [column.name, column]));
        for (const column of view.columns ?? []) {
            columns.set(column.name, showColumn(column, columns.get(column.name)));
        }
        return { columns: [...columns.values()], data: view.data, control: view.control };
    },
});

const createProvider = (kind: PcfFieldBindingProviderKind, metadata: IPcfBindingConfig['metadata'], formatting: IFormatting): IDataProvider => {
    if (kind === 'FetchXml') {
        //its metadata is set once Dataverse's has loaded, so the binding can read Dataverse's values
        return new FetchXmlDataProvider({ fetchXml: '', formatting });
    }
    return new MemoryDataProvider({ dataSource: [], metadata: { ...metadata } as IMemoryProviderEntityMetadata, formatting });
};

//the open view's definitions win, then the other views add what the provider lacks
const addViewColumns = <TData,>(provider: IDataProvider, kind: PcfFieldBindingProviderKind, view: IPcfBindingView<TData>, views: IPcfBindingView<TData>[]): void => {
    const viewColumns = [view, ...views.filter(other => other !== view)].flatMap(other => other.columns ?? []);
    //Dataverse knows the rest
    const addable = kind === 'FetchXml' ? viewColumns.filter(column => column.isVirtual) : viewColumns;
    addColumnDefinitions(provider, view.columns ?? [], addable);
};
