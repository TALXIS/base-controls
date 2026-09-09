import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent } from "@utils";
import { IOptionSetRendererProps } from "./OptionSetRenderer";

export const getOptionSetRendererStyles = (alignment: Required<IOptionSetRendererProps['alignment']>) => {
    return mergeStyleSets({
        optionSetRoot: {
            display: 'flex',
            gap: 5,
            width: '100%',
            justifyContent: getJustifyContent(alignment),
        },
    });
};
