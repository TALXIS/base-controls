import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";
import { IOptionSetRendererProps } from "./OptionSetRenderer";

export const getOptionSetRendererStyles = (alignment: IAlignment) => {
    return mergeStyleSets({
        optionSetRoot: {
            display: 'flex',
            gap: 5,
            width: '100%',
            justifyContent: getJustifyContent(alignment),
        },
    });
};
