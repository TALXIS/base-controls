import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";

export const getOptionSetRendererStyles = (alignment: IAlignment) => {
    return mergeStyleSets({
        optionSetRoot: {
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            width: '100%',
            height: '100%',
            justifyContent: getJustifyContent(alignment),
        },
    });
};
