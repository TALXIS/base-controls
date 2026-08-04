import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Editor from '@monaco-editor/react'
import { IconButton, Toggle, mergeStyleSets } from '@fluentui/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'
import { getDemoRecord, getFormColumns } from '../../form/shared/formModel'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { renderStory } from './storyHelpers'

const codeBlockStyles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
    },
    block: {
        border: '1px solid #edebe9',
        borderRadius: 8,
        overflow: 'hidden',
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
        height: 220,
    },
    codeEditor: {
        height: 640,
    },
})

const StaticCodeBlock = (props: { title: string; value?: string; language?: 'json' | 'typescript'; children?: React.ReactNode }) => {
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
                            height="220px"
                            defaultLanguage={props.language ?? 'json'}
                            language={props.language ?? 'json'}
                            value={props.value}
                            options={{
                                automaticLayout: true,
                                domReadOnly: true,
                                readOnly: true,
                                fontLigatures: true,
                                fontSize: 13,
                                lineNumbersMinChars: 3,
                                minimap: { enabled: false },
                                padding: { top: 12, bottom: 12 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                tabSize: 2,
                                wordWrap: 'on',
                            }}
                            theme="vs-light"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

const ReactComposeOverviewStory = () => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div className={codeBlockStyles.root}>
            <StaticCodeBlock title="Model" value={JSON.stringify(getFormColumns(), null, 2)} />
            <StaticCodeBlock title="Data" value={JSON.stringify(getDemoRecord(), null, 2)} />
            <div className={codeBlockStyles.previewHeader}>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div style={{ minHeight: 0, flex: 1 }}>
                <ReactComposeMode
                    initialView="preview"
                    initialTabsFlavor="pivot"
                    hideTabsFlavorPivot
                    hideWorkspaceViewPivot
                    useStorybookViewport
                    renderPreviewCodeBeforePreview={showCode}
                    renderPreviewCode={({ code, onChange }) => (
                        <div className={codeBlockStyles.codeEditor}>
                            <FormCodeEditor value={code} onChange={onChange} />
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

const meta = {
    title: 'Form/React compose',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            controls: { disable: true },
            description: {
                component: `
Use React compose when you want to build the form purely in React.

In this authoring path, the form structure is defined directly in JSX with \`Form.Root\`, tabs, sections, fields, and optional React-level UI overrides. The runtime still handles binding, validation, notifications, dirty tracking, and save orchestration while keeping the authoring surface fully React-first.

This page focuses on one React-authored form. Expand the code block to inspect or edit the form definition directly.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<ReactComposeOverviewStory />),
}
