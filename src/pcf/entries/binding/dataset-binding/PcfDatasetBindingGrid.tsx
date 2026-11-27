import React from 'react';
import { useDatasetControl } from '@controls/dataset-control';
import { createPcfBindingGridModules, IPcfBindingGridParameters, PcfBindingGrid } from '../shared/PcfBindingGrid';
import type { IPcfDatasetBindingBodyProps } from './PcfDatasetBindingFrame';
import { createPowerAppsInlineRibbonModule, IPowerAppsInlineRibbonParameters } from './power-apps/PowerAppsInlineRibbon';

/** The grid's setup a view of the dataset binding carries in `control.parameters`. */
export interface IPcfDatasetBindingGridParameters extends IPcfBindingGridParameters {
    /** Shows these host commands in the rows. */
    inlineRibbon?: Omit<IPowerAppsInlineRibbonParameters, 'getRecordCommands'>;
}

/** The grid a data-set-bound PCF draws, saving every edit as it is made. */
export const PcfDatasetBindingGrid = (props: IPcfDatasetBindingBodyProps) => {
    const parameters = (useDatasetControl().getView()?.control?.parameters ?? {}) as IPcfDatasetBindingGridParameters;
    const modules = createPcfBindingGridModules({ ...parameters, enableAutoSave: true });
    if (parameters.inlineRibbon) {
        modules.push(createPowerAppsInlineRibbonModule({ ...parameters.inlineRibbon, getRecordCommands: props.getRecordCommands }));
    }
    return <PcfBindingGrid modules={modules} />;
};
