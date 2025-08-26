import { ITheme, mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getGridColumnHeaderStyles = (theme: ITheme, alignment: Required<IColumn['alignment']>) => {
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
        columnDisplayNameText: {
            fontWeight: 600,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        asterix: {
            color: theme.semanticColors.errorText
        },
        svgIcon: {
            minWidth: 20
        },
        aggregationIcon: {
        },
        suffixIconsContainer: {
            display: 'flex',
            alignItems: 'center'
        },
        columnDisplayNameContainer: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            justifyContent: getJustifyContent(alignment),
            order: alignment === 'right' ? 2 : undefined
        }
    })
}

const getJustifyContent = (alignment: Required<IColumn['alignment']>) => {
    switch (alignment) {
        case 'left': {
            return 'flex-start';
        }
        case 'center': {
            return 'center';
        }
        case 'right': {
            return 'flex-end';
        }
        default: {
            undefined
        }
    }
}