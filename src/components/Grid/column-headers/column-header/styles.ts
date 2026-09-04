import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { getJustifyContent } from "@components/Grid/grid/styles";

export const getColumnHeaderStyles = (theme: ITheme, alignment: Required<IColumn['alignment']>) => {
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
            overflow: 'hidden',
            justifyContent: getJustifyContent(alignment),
            //a right-aligned column reads outwards from its edge, so the name follows what a module drew
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

export const getColumnHeaderContextualMenuStyles = (theme: ITheme) => {
    return mergeStyleSets({
        menu: {
            //what a column is already sorted or totalled by is a checked entry, and Fluent only marks it
            //with an icon the entry's own icon has taken
            '.ms-ContextualMenu-link.is-checked': {
                backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                fontWeight: 600
            }
        }
    });
};
