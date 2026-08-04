import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'

const DocsPlaceholder = () => <div style={{ display: 'none' }} />

const meta = {
    title: 'Form/Get started/Form strategy',
    tags: ['autodocs'],
    parameters: {
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
Both authoring paths, **React compose** and **Xrm**, expect the form to receive a strategy that implements \`IFormStrategy\`.

\`Form.Root\` receives that strategy through its \`strategy\` prop, and \`XrmForm\` builds on top of the same base contract. The layout layer may differ, but the runtime input is the same.

## The strategy contract

\`IFormStrategy\` is responsible for loading and saving the record:

\`\`\`ts
export interface IFormStrategy {
  onLoad: () => Promise<IOnLoadResult>;
  onSave: (params: IOnSaveParams) => Promise<IRecordSaveOperationResult>;
}
\`\`\`

The key part for getting the form running is \`onLoad()\`. That load result provides the shared record contract used by both authoring paths.

## What the strategy must provide

The load result is expected to contain:

- \`columns\`
- \`metadata\`
- \`data\`

\`\`\`ts
export interface IOnLoadResult {
  columns: IColumn[];
  data: { [key: string]: any };
  metadata: {
    PrimaryIdAttribute: string;
    PrimaryNameAttribute: string;
  };
}
\`\`\`

## \`columns\`

\`columns\` is the field-definition array for the record. Each item describes one field the form can bind to, including its logical name, display name, and data type.

In practice, this should follow the same \`IColumn[]\` shape used across the Base Controls ecosystem.

\`\`\`ts
const columns = [
  {
    name: "name",
    alias: "name",
    displayName: "Name",
    dataType: "SingleLine.Text",
  },
  {
    name: "telephone1",
    alias: "telephone1",
    displayName: "Phone",
    dataType: "SingleLine.Phone",
  },
];
\`\`\`

For Xrm-style forms, the same field definitions are still required. They are simply used together with FormXml instead of JSX-authored layout.

## \`metadata\`

\`metadata\` is the minimal record-level metadata object:

\`\`\`ts
{
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
}
\`\`\`

\`PrimaryIdAttribute\` identifies the record id field and \`PrimaryNameAttribute\` identifies the primary text field.

This shape is shared between React compose and Xrm.

## \`data\`

\`data\` is the current record payload. Its structure should match a Dataverse-style record object.

That means regular scalar fields live under their logical names, while lookups use the Dataverse lookup payload shape. Formatted values and option-set values can stay in their Dataverse-style form as well.

\`\`\`ts
const data = {
  accountid: "11111111-1111-1111-1111-111111111111",
  name: "Contoso Ltd.",
  telephone1: "+420 123 456 789",
};
\`\`\`

For Xrm specifically, this remains true even though the layout is FormXml-driven. The runtime still expects the same Dataverse-shaped payload.

## What differs between the two paths

React compose uses the shared strategy contract together with JSX-authored layout through \`Form.Root\`, \`Form.Tabs\`, \`Form.Section\`, \`Form.Field\`, and related components.

Xrm uses the same shared strategy contract together with FormXml-authored layout through \`XrmForm\`, plus Microsoft form-context-compatible runtime APIs on top of the same base form runtime.

## In practice

If the form does not bind correctly, the first thing to verify is usually the strategy output:

1. are the fields present in \`columns\`
2. does \`metadata\` point to the correct primary id and primary name fields
3. does \`data\` use the expected Dataverse-style shape, especially for lookups

Once those three inputs are correct, the same record model can drive either authoring path.

Go to [**Get started**](?path=/docs/form-get-started--docs), [**React compose Playground**](?path=/docs/form-react-compose-playground--docs), or [**Xrm Playground**](?path=/docs/form-xrm-playground--docs).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<DocsPlaceholder />),
    parameters: {
        docs: {
            canvas: {
                className: 'form-strategy-hidden-preview',
            },
        },
    },
}
