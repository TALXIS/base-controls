import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Editor from '@monaco-editor/react'
import { IconButton, Toggle, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { XrmComponentsCodeEditor } from '../../form/xrm-form/XrmComponentsCodeEditor'
import { getCurrentFormXml, getXrmRecord, setCurrentFormXml, xrmModelStore } from '../../form/xrm-form/xrmModel'
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
        height: 520,
    },
    xmlEditor: {
        height: 520,
    },
    codeEditor: {
        border: '1px solid #edebe9',
        borderRadius: 8,
        height: 640,
        overflow: 'hidden',
    },
})

const xrmFormReactSnippet = `import React from "react";
import { formMetadata } from "../shared/formModel";
import { defaultFormXml } from "./defaultFormXml";
import { IXrmFormStrategy, MemoryStrategy, XrmForm } from "@talxis/base-controls/components/Form";
import { getXrmRecord, xrmModelStore } from "./xrmModel";

const record = getXrmRecord();
const columns = xrmModelStore.getRuntimeColumns();
const formXml = defaultFormXml;

class StorybookXrmStrategy extends MemoryStrategy implements IXrmFormStrategy {
  public onGetFormXml(): string {
    return formXml;
  }
}

const strategy = new StorybookXrmStrategy({
  onGetData: () => record,
  onGetColumns: () => columns,
  onGetMetadata: () => formMetadata,
});

export const XrmOverviewExample = () => {
  return <XrmForm strategy={strategy} />;
};`

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
                            height="100%"
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

const XrmOverviewStory = () => {
    const [showCode, setShowCode] = React.useState(false)
    const [formXml, setFormXml] = React.useState(() => getCurrentFormXml())
    const [previewKey, setPreviewKey] = React.useState(0)

    React.useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setCurrentFormXml(formXml)
            setPreviewKey((value) => value + 1)
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [formXml])

    return (
        <div className={codeBlockStyles.root}>
            <StaticCodeBlock title="Model" value={JSON.stringify(xrmModelStore.getRuntimeColumns(), null, 2)} />
            <StaticCodeBlock title="Data" value={JSON.stringify(getXrmRecord(), null, 2)} />
            <StaticCodeBlock title="FormXml">
                <div className={codeBlockStyles.xmlEditor}>
                    <FormXmlEditor value={formXml} onChange={setFormXml} hideLabel />
                </div>
            </StaticCodeBlock>
            <div className={codeBlockStyles.previewHeader}>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div style={{ minHeight: 0, flex: 1 }}>
                {showCode ? (
                    <div className={codeBlockStyles.codeEditor}>
                        <XrmComponentsCodeEditor
                            value={xrmFormReactSnippet}
                            label="Using XrmForm in React"
                            path="file:///sandbox/xrm-form-overview.tsx"
                            readOnly
                        />
                    </div>
                ) : (
                    <XrmMode
                        key={previewKey}
                        initialView="preview"
                        hideWorkspaceViewPivot
                        hidePreviewXmlToggle
                        useStorybookViewport
                    />
                )}
            </div>
        </div>
    )
}

const meta = {
    title: 'Form/Xrm/Overview',
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
Use Xrm when you want the form layout to stay model-driven through FormXml while still rendering it as React with \`XrmForm\`.

In this authoring path, the field model and record data are provided through the strategy, while the visible structure comes from FormXml. The runtime preserves the Xrm-style surface for tabs, sections, controls, validation, notifications, and formContext-driven interactions.

This page mirrors the React compose overview: expand the Model and Data blocks to inspect the inputs, review the FormXml panel, then switch **Code** on to see how \`XrmForm\` is wired into React in Storybook.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<XrmOverviewStory />),
}
