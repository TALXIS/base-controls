import { ITheme, mergeStyleSets } from "@fluentui/style-utilities";

export const getKeyboardShortcutHintStyles = (theme: ITheme) => {
    return mergeStyleSets({
        shortcutHint: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '15px',
        },
        key: {
            fontSize: '12px',
            color: theme.semanticColors.bodyText,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.semanticColors.bodyBackgroundHovered,
            borderRadius: '2px',
            padding: ' 2px 4px'
        }
    })
}