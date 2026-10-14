import { mergeStyleSets } from "@fluentui/react";

export const getHeaderEndUiStyles = () => mergeStyleSets({
    //its parts share the header's lines, so they fold and wrap one by one beside Header.Start
    datasetControlHeaderEnd: {
        display: 'contents',
        //the first part pushes the region against the right
        '& > :first-child > *': {
            marginLeft: 'auto',
        },
    },
});
