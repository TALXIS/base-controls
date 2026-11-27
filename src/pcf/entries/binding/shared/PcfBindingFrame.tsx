import React from 'react';
import { initializeIcons } from '@fluentui/react';
import { IColumn, IDataProvider } from '@talxis/client-libraries';
import type { IDatasetControl } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import { IStateStore, StateProvider } from '@core';
import { Labels, LabelsProvider, useLabels } from '@labels';
import { PcfContextProvider } from '@pcf';
import { NotificationMessageBar } from '@ui';
import { AppThemeProvider, ITheme } from '@theme';
import type { IPcfBindingConfig } from './PcfBindingEntry';
import { renderOverride } from './PcfBindingTranslations';
import { PCF_BINDING_LABELS } from './labels';

/** What both binding entries hand their frame. */
export interface IPcfBindingFrameProps<TData = unknown> {
    context: ComponentFramework.Context<any>;
    theme: ITheme;
    height?: string;
    onLoadConfig: (control: IDatasetControl<TData>) => Promise<IPcfBindingConfig<TData>>;
    /** The control's own strings in the user's language. */
    labels?: Labels;
    /** Where the control keeps its state, such as the open view, for the next mount. */
    stateStore?: IStateStore;
    /** Shows a message instead of the control while the form's record is not saved yet. */
    isUnsavedRecord?: boolean;
}

/** The frame props `renderFrame` reads from the PCF's context. */
export type PcfBindingFrameContextPropName = 'context' | 'theme' | 'height';

let areIconsInitialized = false;

const NO_LABELS: Labels = {};

/** Gives a frame's control the PCF context, state, theme and labels. */
export const PcfBindingFrameRoot = (props: Pick<IPcfBindingFrameProps, 'context' | 'theme' | 'labels' | 'stateStore' | 'isUnsavedRecord'> & { children: React.ReactNode }) => {
    if (!areIconsInitialized) {
        initializeIcons();
        areIconsInitialized = true;
    }
    return <PcfContextProvider context={props.context}>
        <StateProvider store={props.stateStore}>
            <AppThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <LabelsProvider labels={props.labels ?? NO_LABELS}>
                    {props.isUnsavedRecord ? <UnsavedRecordMessage /> : props.children}
                </LabelsProvider>
            </AppThemeProvider>
        </StateProvider>
    </PcfContextProvider>;
};

const UnsavedRecordMessage = () => {
    const labels = useLabels(PCF_BINDING_LABELS);
    return <NotificationMessageBar messages={[{ level: 'INFO', text: labels.get('pcfDatasetControl.unsavedRecord') }]} />;
};

/** Lays each definition over the provider's column of the same name and adds the addable ones it lacks. */
export const addColumnDefinitions = (provider: IDataProvider, definitions: IDatasetControlViewColumn[], addable: IDatasetControlViewColumn[] = []): void => {
    const definitionsByName = new Map(definitions.map(column => [column.name, toColumnDefinition(column)]));
    const addableDefinitions = addable.map(toColumnDefinition);
    provider.hooks.availableColumns.add((columns, options) => {
        if (options?.entityName) {
            return;
        }
        columns.forEach((column, index) => {
            const definition = definitionsByName.get(column.name);
            if (definition) {
                const rendered = renderOverride(definition, column);
                columns[index] = { ...column, ...rendered, metadata: { ...column.metadata, ...rendered.metadata } as IColumn['metadata'] };
            }
        });
        for (const column of addableDefinitions) {
            if (!columns.some(existing => existing.name === column.name)) {
                columns.push(renderOverride(column, undefined));
            }
        }
    });
};

//set once Dataverse's has loaded, so the binding can read Dataverse's values
export const applyMetadata = (provider: IDataProvider, metadata: IPcfBindingConfig['metadata']): void => {
    if (metadata) {
        const loaded = provider.getMetadata();
        provider.setMetadata({ ...loaded, ...renderOverride(metadata, loaded) });
    }
};

//the provider loads the fetchXml's own attributes hidden
export const showColumn = (column: IDatasetControlViewColumn, loaded: IDatasetControlViewColumn | undefined): IDatasetControlViewColumn =>
    ({ ...loaded, isHidden: false, ...renderOverride(column, loaded) });

//where and how a view shows the column is the view's own
const toColumnDefinition = ({ isHidden, order, grouping, aggregation, ...definition }: IDatasetControlViewColumn): IColumn => definition as IColumn;
