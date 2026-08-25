import { mergeStyleSets } from "@fluentui/react";

export const getDependenciesCellRendererStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            paddingRight: 8,
            paddingLeft: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    })
}
