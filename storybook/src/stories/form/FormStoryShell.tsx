import React from 'react'
import { Stack, Text, getTheme, mergeStyleSets } from '@fluentui/react'

const theme = getTheme()

const styles = mergeStyleSets({
    shell: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        background: theme.palette.white,
        minWidth: 0,
        boxSizing: 'border-box',
    },
    header: {
        flexShrink: 0,
        minWidth: 0,
        marginBottom: 12,
    },
    content: {
        flex: 1,
        display: 'flex',
        minHeight: 'calc(100vh - 96px)',
        minWidth: 0,
        overflow: 'hidden',
        borderRadius: 8,
        border: `1px solid ${theme.palette.neutralLight}`,
        background: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation4,
    },
    description: {
        color: theme.palette.neutralSecondary,
    },
    globalScope: {
        selectors: {
            ':global(.toast)': {
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 1000,
                width: 'min(440px, calc(100vw - 32px))',
                padding: '14px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: 14,
                background: '#ffffff',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
            },
            ':global(.toast-success)': {
                borderColor: '#86efac',
                background: '#f0fdf4',
            },
            ':global(.toast-error)': {
                borderColor: '#fca5a5',
                background: '#fef2f2',
            },
            ':global(.toast-header)': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8,
            },
            ':global(.toast-close)': {
                border: 0,
                padding: 0,
                color: '#475569',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
            },
            ':global(.toast-details)': {
                margin: 0,
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: 12,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: 240,
            },
        },
    },
})

interface IFormStoryShellProps {
    title: string
    description: string
    children: React.ReactNode
}

export const FormStoryShell = (props: IFormStoryShellProps) => {
    return <Stack className={styles.shell}>
        <div className={styles.globalScope} />
        <Stack tokens={{ childrenGap: 4 }} className={styles.header}>
            <Text variant="xLarge">{props.title}</Text>
            <Text variant="medium" className={styles.description}>{props.description}</Text>
        </Stack>
        <div className={styles.content}>{props.children}</div>
    </Stack>
}
