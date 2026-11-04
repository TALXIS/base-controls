import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { overviewFormContextExample } from './formContextExamples'
import { XrmFormContextOverviewPreview } from './XrmFormContextOverviewPreview'
import { XrmComponentsCodeEditor } from '../../form/xrm-form/XrmComponentsCodeEditor'
import { XrmCustomComponentsLivePreview } from './XrmCustomComponentsLivePreview'
import { ExampleRunner, renderStory } from './storyHelpers'

interface IXrmFormContextArgs {
}

const onFormReadyCode = `const strategy = new XrmMemoryStrategy({
  onGetData: () => getCustomComponentsRecord(),
  onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => getCustomComponentsFormXml(),
});

const XrmCustomComponentsExample = () => (
  <XrmForm
    strategy={strategy}
    onFormReady={({ formContext }) => {
      //the record is already loaded when this fires
      const name = formContext.data.entity.getPrimaryAttributeValue();
      formContext.ui.setFormNotification(\`Loaded \${name}\`, "INFO", "loaded");
    }}
  />
);`

const OnFormReadyExample = () => {
    const [code, setCode] = React.useState(onFormReadyCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)

    return (
        <ExampleRunner
            code={code}
            seedCode={onFormReadyCode}
            onCodeChange={setCode}
            error={compileError}
            renderPreview={() => <XrmCustomComponentsLivePreview code={code} onError={setCompileError} />}
            renderCode={() => (
                <XrmComponentsCodeEditor value={code} onChange={setCode} readOnly={false} label="" kind="components" height="640px" />
            )}
        />
    )
}

const meta = {
    title: 'Controls/Form/Xrm/Form Context/Overview',
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
            description: {
                component: `
\`formContext\` is the Xrm runtime handle exposed by \`XrmForm\`, shaped after the Microsoft model-driven-app \`formContext\`. It reads values, toggles visibility, enables controls, handles events, focuses tabs and coordinates saves.

It matches Microsoft's [formContext](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context) in shape and intent, not every Client API feature; the [formContext.data](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data) and [formContext.ui](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-ui) references cover most of what you call.

Switch on **Code** below, write the body of \`onExecuteScenario\`, then press **Run code** to run it against the form. For ready-made patterns, go to [**Samples**](?path=/docs/controls-form-xrm-form-context-samples--overview).
                `.trim(),
            },
        },
    },
    render: () => renderStory(
        <XrmFormContextOverviewPreview docsExample={overviewFormContextExample} />,
    ),
} satisfies Meta<IXrmFormContextArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
}

export const GetFormContext: Story = {
    name: 'Get formContext from onFormReady',
    parameters: {
        docs: {
            description: {
                story: 'Your own `XrmForm` hands you `formContext` through `onFormReady`. Try: change the notification level to `"WARNING"`, or add `formContext.getControl("customLeadName").setDisabled(true)`.',
            },
        },
    },
    render: () => renderStory(<OnFormReadyExample />),
}
