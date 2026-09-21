import { ITheme, mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";

export const getColumnHeaderStyles = (theme: ITheme, alignment: IAlignment) => {
    return mergeStyleSets({
        commandBarButtonRoot: {
            width: '100%',
            height: 42,
            paddingLeft: 10,
            paddingRight: 10,
            overflow: 'hidden'
        },
        commandBarButtonFlexContainer: {
            gap: 5
        },
        columnDisplayNameContainer: {
            display: 'flex',
            flex: 1,
            gap: 5,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: getJustifyContent(alignment),
            //a right-aligned column reads outwards from its edge
            order: alignment === 'right' ? 2 : undefined
        },
        columnDisplayNameText: {
            fontWeight: 600,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        asterix: {
            color: theme.semanticColors.errorText
        },
        suffixIconsContainer: {
            display: 'flex',
            alignItems: 'center'
        }
    })
}
