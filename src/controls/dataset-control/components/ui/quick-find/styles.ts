import { AnimationVariables, mergeStyleSets } from "@fluentui/react";

export const getQuickFindUiStyles = (isTakingOver: boolean) => mergeStyleSets({
    datasetControlQuickFind: [
        {
            flex: '0 1 230px',
            minWidth: 160,
        },
        //alone in the header while the rest is hidden
        isTakingOver && {
            flex: '1 1 100%',
        },
    ],
    compactQuickFind: {
        flexShrink: 0,
    },
    //the box is reused from the compact button, so the entry runs on the field, which is new
    expandedField: {
        clipPath: 'inset(0 0 0 0)',
        opacity: 1,
        transition: `clip-path ${AnimationVariables.durationValue2} ${AnimationVariables.easeFunction1}, opacity ${AnimationVariables.durationValue2} ${AnimationVariables.easeFunction1}`,
        '@starting-style': {
            clipPath: 'inset(0 0 0 calc(100% - 32px))',
            opacity: 0,
        },
        '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
        },
    },
});
