import React from 'react'
import Editor from '@monaco-editor/react'
import { ActionButton, IconButton, ITheme, Pivot, PivotItem, Text, mergeStyleSets, useTheme } from '@fluentui/react'
import { baseEditorOptions, useMonacoTheme } from '../../form/shared/monacoEditor'

export const renderStory = (node: React.ReactNode, padding = 18) => (
    <div style={{ padding, height: '100%' }}>{node}</div>
)

//in the colours of the text around them, so they follow any theme
const DIVIDER = '1px solid color-mix(in srgb, currentColor 15%, transparent)'

export const codeBlockStyles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
    },
    block: {
        border: DIVIDER,
        borderRadius: 8,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'color-mix(in srgb, currentColor 4%, transparent)',
        borderBottom: DIVIDER,
        fontSize: 14,
        fontWeight: 600,
    },
    previewHeader: {
        borderBottom: DIVIDER,
        display: 'flex',
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    editor: {
        height: 520,
    },
    codeEditor: {
        border: DIVIDER,
        borderRadius: 8,
        height: 640,
    },
})

interface IStaticCodeBlockProps {
    title: string
    value?: string
    language?: 'json' | 'typescript'
    children?: React.ReactNode
}

export const StaticCodeBlock = (props: IStaticCodeBlockProps) => {
    const monacoTheme = useMonacoTheme()
    const [collapsed, setCollapsed] = React.useState(true)

    return (
        <div className={codeBlockStyles.block}>
            <div className={codeBlockStyles.header}>
                <span>{props.title}</span>
                <IconButton
                    iconProps={{ iconName: collapsed ? 'ChevronDown' : 'ChevronUp' }}
                    onClick={() => setCollapsed((current) => !current)}
                />
            </div>
            {!collapsed && (
                <div className={codeBlockStyles.editor}>
                    {props.children ?? (
                        <Editor
                            height="100%"
                            defaultLanguage={props.language ?? 'json'}
                            language={props.language ?? 'json'}
                            value={props.value}
                            options={{
                                ...baseEditorOptions,
                                domReadOnly: true,
                                padding: { top: 12, bottom: 12 },
                                readOnly: true,
                            }}
                            theme={monacoTheme}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

const getExampleRunnerStyles = (theme: ITheme) => mergeStyleSets({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
        marginBottom: 12,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    edited: {
        color: theme.semanticColors.bodySubtext,
        marginRight: 4,
    },
    previewFrame: {
        minHeight: 420,
        width: '100%',
    },
    hidden: {
        display: 'none',
    },
    codeFrame: {
        border: `1px solid ${theme.semanticColors.bodyDivider}`,
        borderRadius: 4,
        overflow: 'hidden',
    },
    error: {
        display: 'block',
        marginTop: 8,
        color: theme.semanticColors.errorText,
    },
})

interface IExampleRunnerProps {
    /** The code the editor holds now. */
    code: string
    /** The code the example starts with, which Reset restores. */
    seedCode: string
    onCodeChange: (code: string) => void
    /** Runs after Reset has restored the seed code. */
    onReset?: () => void
    renderPreview: () => React.ReactNode
    renderCode: () => React.ReactNode
    error?: string | null
    /**
     * Overrides the frame's own minimum. Pass `0` for a control that sizes itself, so the preview is as
     * tall as the control rather than leaving space under it.
     */
    previewMinHeight?: number
}

type IExampleRunnerTab = 'preview' | 'code'

/** The same Preview and Code tabs as the grid's examples, for examples that run through their own preview. */
export const ExampleRunner = (props: IExampleRunnerProps) => {
    const theme = useTheme()
    const styles = React.useMemo(() => getExampleRunnerStyles(theme), [theme])
    const [tab, setTab] = React.useState<IExampleRunnerTab>('preview')
    const [isCopied, setIsCopied] = React.useState(false)

    const reset = () => {
        props.onCodeChange(props.seedCode)
        props.onReset?.()
    }

    const copy = async () => {
        await navigator.clipboard?.writeText(props.code)
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), 1500)
    }

    return <div>
        <div className={styles.toolbar}>
            <Pivot headersOnly selectedKey={tab} onLinkClick={item => setTab(item?.props.itemKey as IExampleRunnerTab)}>
                <PivotItem itemKey='preview' headerText='Preview' itemIcon='View' />
                <PivotItem itemKey='code' headerText='Code' itemIcon='Code' />
            </Pivot>
            <div className={styles.actions}>
                {props.code !== props.seedCode && <Text variant='small' className={styles.edited}>Edited</Text>}
                <ActionButton iconProps={{ iconName: 'Undo' }} text='Reset' title="Restore the example's code" onClick={reset} />
                <ActionButton iconProps={{ iconName: isCopied ? 'CheckMark' : 'Copy' }} text={isCopied ? 'Copied' : 'Copy code'} onClick={() => { copy() }} />
            </div>
        </div>
        {/* both stay mounted, so a preview keeps its state while its code is edited */}
        <div className={tab === 'preview' ? styles.previewFrame : styles.hidden} style={props.previewMinHeight === undefined ? undefined : { minHeight: props.previewMinHeight }}>{props.renderPreview()}</div>
        <div className={tab === 'code' ? styles.codeFrame : styles.hidden}>{props.renderCode()}</div>
        {props.error ? <Text variant='small' className={styles.error}>{props.error}</Text> : null}
    </div>
}
