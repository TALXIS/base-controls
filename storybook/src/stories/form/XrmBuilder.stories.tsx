import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

type TXrmWorkspaceView = 'preview' | 'builder' | 'data' | 'model'

type TBuilderEditorMode = 'ui' | 'xml'
type TDataEditorMode = 'ui' | 'json'
type TModelEditorMode = 'ui' | 'json'

interface IXrmPlaygroundArgs {
    view: TXrmWorkspaceView
    builderEditorMode: TBuilderEditorMode
    dataEditorMode: TDataEditorMode
    modelEditorMode: TModelEditorMode
    showPreviewXml: boolean
}

const meta = {
    title: 'Form/Xrm',
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
Use Xrm Form when the form should be driven by FormXml and expose \`formContext\`. This page focuses on the main Xrm Form authoring surface: the FormXml-driven layout, record payload, and builder-oriented workflow. Use the FormXml toggle to switch between the live form preview and the code editor.

## Basic usage in React

\`\`\`tsx
import { XrmForm, XrmMemoryStrategy } from "@talxis/base-controls/components/Form";

const strategy = new XrmMemoryStrategy({
  onGetData: () => record,
  onGetColumns: () => columns,
  onGetMetadata: () => ({
    PrimaryIdAttribute: "accountid",
    PrimaryNameAttribute: "name",
  }),
  onGetFormXml: () => formXml,
});

export const AccountXrmForm = () => {
  return <XrmForm strategy={strategy} />;
};
\`\`\`

## Related docs

For the runtime \`formContext\` API surface and lifecycle guidance, go to [**Form context**](?path=/docs/form-xrm-form-context--docs).
                `.trim(),
            },
        },
    },
} satisfies Meta<IXrmPlaygroundArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(
        <XrmMode
            initialView="preview"
            initialBuilderEditorMode="ui"
            initialDataEditorMode="json"
            initialModelEditorMode="ui"
            initialShowPreviewXml={false}
            hideWorkspaceViewPivot
            hideBuilderEditorModeToggle
            hideDataEditorModeToggle
            hideModelEditorModeToggle
            useStorybookViewport
        />,
    ),
}
