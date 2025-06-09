import { mergeStyleSets, ITheme } from "@fluentui/react";

export const getPagingStyles = (theme: ITheme) => {
    return mergeStyleSets({
        datasetPagingRoot: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        pagination: {
            '.ms-CommandBar': {
                paddingLeft: 0,
                paddingRight: 0,
            }
        },
        currentPageBtn: {
            '.ms-Button-label': {
                color: theme.semanticColors.bodyText
            }
        },
        pageSizeBtnWrapper: {
            flexGrow: 1,
            display: 'flex',
            '.ms-Button-label': {
                whiteSpace: 'nowrap',
            },
            '.ms-Button': {
                height: 44
            }
        },
        pageSizeOption: {
            '& .is-checked': {
                backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                fontWeight: 600
            }
        }
    });
};