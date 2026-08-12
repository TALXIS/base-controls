import React from 'react'
import Editor from '@monaco-editor/react'
import { IconButton, Text, Toggle, getTheme, mergeStyleSets } from '@fluentui/react'
import { baseEditorOptions } from '../../form/shared/monacoEditor'

const theme = getTheme()

export const renderStory = (node: React.ReactNode, padding = 18) => (
    <div style={{ padding, height: '100%' }}>{node}</div>
)

export const codeBlockStyles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
    },
    block: {
        border: '1px solid #edebe9',
        borderRadius: 8,
        background: '#fff',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#faf9f8',
        borderBottom: '1px solid #edebe9',
        fontSize: 14,
        fontWeight: 600,
    },
    previewHeader: {
        borderBottom: '1px solid #edebe9',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    editor: {
        height: 520,
    },
    codeEditor: {
        border: '1px solid #edebe9',
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
                            theme="vs-light"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

const exampleRunnerStyles = mergeStyleSets({
    header: {
        borderBottom: `1px solid ${theme.palette.neutralLighter}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
        flexWrap: 'wrap',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    previewFrame: {
        minHeight: 420,
        width: '100%',
    },
    codeFrame: {
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: 8,
    },
    viewportWindow: {
        width: '100%',
    },
    error: {
        color: theme.palette.redDark,
    },
})

interface IExampleRunnerProps {
    renderPreview: () => React.ReactNode
    renderCode: () => React.ReactNode
    error?: string | null
}

/** Toggles between a live preview and its source, shared by every "editable example" doc page. */
export const ExampleRunner = ({ renderPreview, renderCode, error }: IExampleRunnerProps) => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div>
            <div className={exampleRunnerStyles.header}>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div className={exampleRunnerStyles.body}>
                <div className={exampleRunnerStyles.previewFrame}>
                    <div className={exampleRunnerStyles.viewportWindow}>
                        {showCode ? <div className={exampleRunnerStyles.codeFrame}>{renderCode()}</div> : renderPreview()}
                    </div>
                </div>
                {error ? <Text variant="small" className={exampleRunnerStyles.error}>{error}</Text> : null}
            </div>
        </div>
    )
}
