import { mergeStyleSets } from '@fluentui/react';

export const getPcfDatasetControlEntryStyles = () => mergeStyleSets({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    //a percentage height resolves to nothing under a parent that only has a min-height
    frame: {
        flexGrow: 1,
    },
});
