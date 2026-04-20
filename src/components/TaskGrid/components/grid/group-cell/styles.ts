import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGroupCellStyles = (theme: ITheme, expanded: boolean) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            backgroundColor: theme.semanticColors.bodyBackground,
            '.ms-Link': {
                fontWeight: '600'
            },
            '>div': {
                overflow: 'hidden'
            }
        },
        chevronButton: {
            height: '25px',
            width: '25px',
            marginLeft: 8,
            color: theme.semanticColors.bodyText,
            selectors: {
                '.ms-Button-icon': {
                    transition: 'transform 0.2s ease',
                    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    fontSize: '13px',
                    fontWeight: 600
                },
                ':hover': {
                    color: theme.semanticColors.bodyText,
                },
                ':active': {
                    color: theme.semanticColors.bodyText,
                },
            },
        },
    });
};
