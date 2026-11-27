import React from 'react';
import { IColumn, IDataProvider } from '@talxis/client-libraries';
import type { IDatasetControl } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import type { IStateStore } from '@core';
import { Labels, useLabels } from '@labels';
import { NotificationMessageBar } from '@ui';
import type { ITheme } from '@theme';
import type { IPcfDatasetControlConfig } from './PcfBindingEntryShared';
import { renderOverride } from './PcfDatasetControlTranslations';
import { PCF_DATASET_CONTROL_LABELS } from './labels';

/** What both binding entries hand their frame. */
export interface IPcfBindingFrameProps<TData = unknown> {
    context: ComponentFramework.Context<any>;
    theme: ITheme;
    height?: string;
    onLoadConfig: (control: IDatasetControl<TData>) => Promise<IPcfDatasetControlConfig<TData>>;
    /** The control's own strings in the user's language. */
    labels?: Labels;
    /** Where the control keeps its state, such as the open view, for the next mount. */
    stateStore?: IStateStore;
}

/** The frame props `renderFrame` reads from the PCF's context. */
export type PcfBindingFrameContextPropName = 'context' | 'theme' | 'height';

/** What a frame shows in place of the control while the form's record is not saved yet. */
export const UnsavedRecordMessage = () => {
    const labels = useLabels(PCF_DATASET_CONTROL_LABELS);
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
export const applyMetadata = (provider: IDataProvider, metadata: IPcfDatasetControlConfig['metadata']): void => {
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
