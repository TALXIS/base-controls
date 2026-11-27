import React from 'react';
import { useDatasetControl } from '@controls/dataset-control';
import { createPcfBindingGridModules, IPcfBindingGridParameters, PcfBindingGrid } from '../shared/PcfBindingGrid';

/** The grid a field-bound PCF draws. */
export const PcfFieldBindingGrid = () => {
    const parameters = (useDatasetControl().getView()?.control?.parameters ?? {}) as IPcfBindingGridParameters;
    return <PcfBindingGrid modules={createPcfBindingGridModules(parameters)} />;
};
