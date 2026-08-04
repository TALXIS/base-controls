import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { xrmBusinessFlowScenarios } from '../../form/xrm-form/xrmBusinessFlows'
import { renderStory } from './storyHelpers'

interface IXrmFormContextArgs {
    scenarioId: string
    showCodePanel: boolean
    showConsole: boolean
}

const scenarioOptions = xrmBusinessFlowScenarios.map((scenario) => scenario.id)
const scenarioLabels = Object.fromEntries(xrmBusinessFlowScenarios.map((scenario) => [scenario.id, scenario.title]))

const meta = {
    title: 'Form/Xrm/Form context',
    tags: ['autodocs'],
    args: {
        scenarioId: scenarioOptions[0],
        showCodePanel: true,
        showConsole: false,
    },
    argTypes: {
        scenarioId: {
            control: 'select',
            options: scenarioOptions,
            mapping: undefined,
            labels: scenarioLabels,
        },
        showCodePanel: {
            control: 'boolean',
        },
        showConsole: {
            control: 'boolean',
        },
    },
    parameters: {
        docs: {
            description: {
                component: `
\`formContext\` is the Xrm runtime handle exposed by \`XrmForm\`, which builds on top of the base Form runtime, keeps the layout FormXml-driven, and exposes an API shaped to be compatible with the Microsoft model-driven-app \`formContext\` programming model.

## Retrieving formContext

Use the \`onFormReady\` callback on \`XrmForm\` to get access to \`formContext\`.

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
  return (
    <XrmForm
      strategy={strategy}
      onFormReady={({ formContext, api }) => {
        console.log(formContext.data.entity.getId());
        console.log(api.getData());
      }}
    />
  );
};
\`\`\`

## Relation to Microsoft formContext

This API is intended for the same style of runtime interaction as Microsoft Client API \`formContext\`: reading values, changing visibility, enabling or disabling controls, responding to events, focusing tabs, and coordinating save-related logic.

It is **compatible in shape and intent**, but it is not a claim of full one-to-one parity with every Microsoft Client API feature. Treat it as a Base Controls Xrm runtime surface modeled after the Microsoft \`formContext\` approach.

Microsoft Learn references:

- [formContext](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context)
- [formContext.data](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data)
- [formContext.ui](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-ui)
- [attribute methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/attributes)
- [control methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/controls)
                `.trim(),
            },
        },
    },
    render: (args: IXrmFormContextArgs) => renderStory(
        <XrmMode
            initialView="form-context"
            initialFormContextScenarioId={args.scenarioId}
            formContextScenarioIds={[args.scenarioId]}
            hideWorkspaceViewPivot
            useStorybookViewport
            showFormContextCodePanel={args.showCodePanel}
            hideFormContextConsole={!args.showConsole}
        />,
    ),
} satisfies Meta<IXrmFormContextArgs>

export default meta

type Story = StoryObj<typeof meta>

export const FormContextScenarios: Story = {}
