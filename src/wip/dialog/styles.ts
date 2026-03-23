import { ITheme, mergeStyleSets } from "@fluentui/react"

interface IStyleOptions {
    theme: ITheme
    width?: string;
    height?: string;
}

export const getDialogStyles = (options: IStyleOptions) => {
    const { theme, width, height } = options || {};
    return mergeStyleSets({
        scrollableContent: {
            display: 'flex',
            maxHeight: 'initial'
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
        },
        dialogTitle: {
            '&&': {
                padding: 0,
                flex: 1
            }
        },
        topButton: {
            '&&': {
                position: 'initial',
                padding: 0
            }
        },
        dialogInner: {
            '&&': {
                display: 'flex',
                minHeight: 0,
                padding: 0,
                flexGrow: 1
            }
        },
        subtext: {
            margin: 0,
            paddingLeft: 15,
            paddingRight: 15
        },
        dialogHeader: {
            padding: 15,
            display: 'flex',
            gap: 5
        },
        innerContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
            position: 'initial'
        },
        footer: {
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
            padding: 15,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8
        },
        dialogMain: {
            '&&': {
                width: width,
                height: height,
                minWidth: 'initial',
                '@media (min-width: 480px)': {
                    maxWidth: 'calc(100% - 32px)',
                },
                '@media (max-width: 479px)': {
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: width ??  (!height ? '100%' : undefined),
                    height: height ?? (!width ? '100%' : undefined),
                    borderRadius: 0
                },
            }
        }
    })
}