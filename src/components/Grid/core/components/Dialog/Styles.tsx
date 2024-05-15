import { mergeStyles, getTheme } from "@fluentui/react/lib/Styling";
import { IDialogProps } from './interfaces/index';

export const getRootStyles = (props: IDialogProps): string => {
    const theme = getTheme();
    const rootStyles = mergeStyles(({
        selectors: {
            '.ms-Dialog-main': {
                width: props.width,
                minHeight: props.minHeight ?? 0,
                height: props.height,
            },
            '@media(max-width: 768px)': {
                '.ms-Dialog-main': {
                    width: '100vw',
                    height: '100svh',
                    maxWidth: '100vw',
                    maxHeight: '100svh'
                }
            },
            '.ms-Dialog-subText': {
                color: theme.palette.black
            },
            '.ms-Dialog-content': {
                overflow: 'auto',
                paddingBottom: 24,
                flex: 1
            },
            '.ms-Dialog-content, .ms-Dialog-actions': {
                paddingLeft: 24,
                paddingRight: 24,
                width: 'initial'
            },
            '.ms-Dialog-actions': {
                borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
                paddingBottom: 24,
                paddingTop: 24,
                margin: 'initial',
                flex: '0 0 auto'
            },
            '.ms-Dialog-inner': {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflow: 'hidden'
            },
            '.ms-Modal-scrollableContent': {
                overflow: 'hidden',
                display: 'flex',
                '> div': {
                    display: 'flex',
                    flexDirection: 'column'
                }

            },

        }
    }));
    return rootStyles;
};