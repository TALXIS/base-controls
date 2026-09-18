import { mergeStyleSets } from "@fluentui/react";

export const getMapStyles = () => {
    return mergeStyleSets({
        root: {
            width: '100%',
            height: '100%',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
        }
    });
};
