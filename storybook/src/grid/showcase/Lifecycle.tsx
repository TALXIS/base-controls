import React from 'react'
import { mergeStyleSets } from '@fluentui/react'
import { StorybookTheme, useTheme } from 'storybook/theming'

//in the docs page's own theme, light or dark
const getStyles = (theme: StorybookTheme) => mergeStyleSets({
    root: {
        listStyle: 'none',
        margin: '16px 0 24px',
        padding: 0,
    },
    step: {
        position: 'relative',
        display: 'flex',
        gap: 16,
        paddingBottom: 20,
        selectors: {
            //the rail joining a step to the next
            '::before': {
                content: '""',
                position: 'absolute',
                top: 30,
                bottom: 2,
                left: 13,
                width: 2,
                background: theme.appBorderColor,
            },
            ':last-child': { paddingBottom: 0 },
            ':last-child::before': { display: 'none' },
        },
    },
    marker: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: `color-mix(in srgb, ${theme.color.secondary} 15%, transparent)`,
        color: theme.color.secondary,
        fontSize: 13,
        fontWeight: 600,
    },
    body: {
        minWidth: 0,
        paddingTop: 3,
    },
    heading: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        gap: '4px 10px',
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: 600,
    },
    hook: {
        padding: '1px 6px',
        borderRadius: 4,
        border: `1px solid ${theme.appBorderColor}`,
        fontFamily: theme.typography.fonts.mono,
        fontSize: 12,
        color: theme.color.secondary,
    },
    text: {
        color: theme.textMutedColor,
        fontSize: 14,
        lineHeight: '21px',
    },
    code: {
        padding: '0 4px',
        borderRadius: 3,
        background: `color-mix(in srgb, currentColor 10%, transparent)`,
        fontFamily: theme.typography.fonts.mono,
        fontSize: 12.5,
    },
})

/** One step of a lifecycle, in the order it happens. */
export interface ILifecycleStep {
    title: string
    /** One plain sentence; `backticks` mark code. */
    text: string
    /** Where your code joins in at this step, such as a callback or option. */
    hook?: string
}

interface ILifecycleProps {
    steps: ILifecycleStep[]
}

/** What happens, step by step, and where your code joins in. */
export const Lifecycle = (props: ILifecycleProps) => {
    const theme = useTheme()
    const styles = React.useMemo(() => getStyles(theme), [theme])
    const renderText = (text: string) => text.split(/(`[^`]+`)/).map((part, index) => part.startsWith('`')
        ? <code key={index} className={styles.code}>{part.slice(1, -1)}</code>
        : part)

    return <ol className={styles.root}>
        {props.steps.map((step, index) => <li key={step.title} className={styles.step}>
            <span className={styles.marker}>{index + 1}</span>
            <div className={styles.body}>
                <div className={styles.heading}>
                    <span className={styles.title}>{step.title}</span>
                    {step.hook && <code className={styles.hook}>{step.hook}</code>}
                </div>
                <div className={styles.text}>{renderText(step.text)}</div>
            </div>
        </li>)}
    </ol>
}
