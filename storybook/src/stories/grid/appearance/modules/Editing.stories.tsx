import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { SaveStatusExample } from '../../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
The editing module adds two columns of its own: one a row reports its save in, keyed \`RECORD_SAVE_COLUMN_KEY\`, and one a record locked as a whole shows its lock in, keyed \`RECORD_LOCK_COLUMN_KEY\`. To draw either your own way, set its \`cellRenderer\` in \`colDefs\`, reuse the module's cell and replace its parts through \`components\`.

\`\`\`tsx
const SaveStatusCell = (props: IGridCellParams) => <RecordSaveIndicatorCell {...props} components={SAVE_STATUS} />

<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
    colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { cellRenderer: SaveStatusCell } }} />
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.
- With row selection on, the save status is drawn in the checkbox column by \`RecordSaveSelectionCell\`, which also takes \`checkbox\`. Set it on \`SELECTION_COLUMN_KEY\`.

| Cell | Key | Parts | What it draws |
|---|---|---|---|
| \`RecordSaveIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the save status is drawn in |
| | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\`, \`onRenderErrorCallout\` | The status: a spinner while saving, then a button |
| | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\` | The callout a failed save opens |
| \`RecordLockIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the lock is drawn in |
| | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | The lock |

{{story: Save status your way}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Editing',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SaveStatusYourWay: Story = {
    name: 'Save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `The save column's \`cellRenderer\` is \`RecordSaveIndicatorCell\` with \`indicator\` and \`errorCallout\` replaced: a labelled button, and the product's name in the failed-save callout. Set a price above 1,000.`,
            },
        },
    },
}
