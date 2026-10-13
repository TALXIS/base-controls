import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { WatchControlExample } from '../../../dataset-control/examples/propsAndEventsExamples'

const DESCRIPTION = `Everything \`<DatasetControl />\` takes, and the events it raises. The props of each part are on its page under [**Parts**](?path=/docs/datasetcontrol-parts-overview--overview).

## Props

| Prop | Type | Default | Read | What it does |
|---|---|---|---|---|
| \`onLoad\` | \`(params) => Promise<IDatasetControlLoadResult>\` | Required | On every load | Returns the provider, and the view it shows. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview). |
| \`children\` | \`ReactNode\` | Required | Live | The parts. See [**Layout**](?path=/docs/datasetcontrol-layout-overview--overview). |
| \`height\` | \`string\` | None | Live | The control's height. \`'100%'\` fills the parent; the content's height when left out. See *Height* on [**Layout**](?path=/docs/datasetcontrol-layout-overview--overview). |
| \`className\` | \`string\` | None | Live | Added to the control's box. |
| \`stateKey\` | \`string\` | None | At mount | The key the control keeps where the user was under. Without one, it keeps nothing for the next mount. See [**State**](?path=/docs/datasetcontrol-state-overview--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Live | Whether the control destroys the providers it lets go of: on unmount, on a view switch and after a failed load. Set \`false\` when the provider is shared. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview). |
| \`labels\` | \`Partial<IDatasetControlLabels>\` | \`DATASET_CONTROL_LABELS\`, in English | At mount | The control's own strings. See [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | Live | \`onRenderContainer\`, the control's box; \`skeleton\`, the placeholder; \`errorMessage\`, how a failed load looks. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | Live | Hands you the control once it exists, before the first load. |
| \`onDestroyed\` | \`(control: IDatasetControl) => void\` | None | Live | Hands you the control as it unmounts. |

## Events

Subscribe through \`control.events.addEventListener\`, in \`onReady\`. What else the control offers is on [**Extending**](?path=/docs/datasetcontrol-customization-extending--overview).

| Event | Arguments | When it fires |
|---|---|---|
| \`onLoadStarted\` | None | When a load starts: the first load, every view switch, \`loadView()\` and \`reload()\`. |
| \`onLoaded\` | \`provider: IDataProvider\` | When a load is done. Its provider is now the one shown, and every part mounts anew on it. |
| \`onLoadFailed\` | \`error: unknown\` | When a load fails. The provider shown before, if any, stays, and the error shows in place of the parts. |
| \`onDestroyed\` | None | As the control unmounts. |

{{story: Watch the control}}
`

const meta = {
    title: 'DatasetControl/Get started/Props and events',
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

export const WatchTheControl: Story = {
    name: 'Watch the control',
    render: () => renderStory(<WatchControlExample />),
    parameters: {
        docs: {
            description: {
                story: `Every event of the control, newest first. Switch the view, press *Show won deals*, which calls \`loadView('won')\`, or *Remount* to see \`onDestroyed\` and a fresh \`onReady\`.`,
            },
        },
    },
}
