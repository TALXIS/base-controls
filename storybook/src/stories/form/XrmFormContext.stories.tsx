import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { overviewFormContextExample } from './formContextExamples'
import { XrmFormContextOverviewPreview } from './XrmFormContextOverviewPreview'
import { renderStory } from './storyHelpers'

interface IXrmFormContextArgs {
}

const meta = {
    title: 'Form/Xrm/Form Context/Overview',
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
\`formContext\` is the Xrm runtime handle exposed by \`XrmForm\`, which builds on top of the base Form runtime, keeps the layout FormXml-driven, and exposes an API shaped to be compatible with the Microsoft model-driven-app \`formContext\` programming model.

This overview page focuses on the interactive runtime surface: the form preview is shown first, and the **Code** toggle switches to a Monaco editor where you can edit the method executed by the **Run code** action.

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

For ready-made patterns built on the same runtime, go to [**Samples**](?path=/docs/form-xrm-form-context-samples--docs).
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
