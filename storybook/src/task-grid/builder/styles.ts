import { ITheme, mergeStyleSets } from '@fluentui/react'

export const getTaskGridBuilderStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    heading: {
        fontWeight: 600,
        fontSize: 16,
    },
    options: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px 20px',
    },
    option: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    description: {
        paddingLeft: 28,
        fontSize: 12,
        color: theme.semanticColors.bodySubtext,
    },
    note: {
        fontSize: 13,
        color: theme.semanticColors.bodySubtext,
    },
    runner: {
        borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
        paddingTop: 12,
    },
})
