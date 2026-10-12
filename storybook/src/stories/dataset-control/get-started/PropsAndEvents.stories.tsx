import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { WatchRuntimeExample } from '../../../dataset-control/examples/propsAndEventsExamples'

const DESCRIPTION = `Everything \`<DatasetControl />\` takes, and the events of its runtime. The props of each part are on its page under [**Parts**](?path=/docs/datasetcontrol-parts-overview--overview).

## Props

| Prop | Type | Default | Read | What it does |
|---|---|---|---|---|
| \`onLoad\` | \`(params) => Promise<IDatasetControlLoadResult>\` | Required | On every load | Returns the provider, and optionally the views. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview). |
| \`children\` | \`ReactNode\` | Required | Live | The parts. See [**Layout**](?path=/docs/datasetcontrol-layout-overview--overview). |
| \`height\` | \`string\` | None | Live | The control's height. \`'100%'\` fills the parent; the content's height when left out. See *Height* on [**Layout**](?path=/docs/datasetcontrol-layout-overview--overview). |
| \`className\` | \`string\` | None | Live | Added to the control's box. |
| \`stateKey\` | \`string\` | None | At mount | The key the control keeps where the user was under. Without one, it keeps nothing for the next mount. See [**State**](?path=/docs/datasetcontrol-state-overview--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Live | Whether the control destroys the providers it lets go of: on unmount, on a view switch and after a failed load. Set \`false\` when the provider is shared. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview). |
| \`labels\` | \`Partial<IDatasetControlLabels>\` | \`DATASET_CONTROL_LABELS\`, in English | At mount | The control's own strings. See [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | Live | \`onRenderContainer\`, the control's box; \`skeleton\`, the placeholder; \`errorMessage\`, how a failed load looks. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |
| \`onReady\` | \`(runtime) => void\` | None | Live | Hands you the runtime once it exists, before the first load. |
| \`onDestroyed\` | \`(runtime) => void\` | None | Live | Hands you the runtime as the control unmounts. |

## Runtime events

Subscribe through \`runtime.events.addEventListener\`, in \`onReady\`. What else the runtime offers is on [**Extending**](?path=/docs/datasetcontrol-customization-extending--overview).

| Event | Arguments | When it fires |
|---|---|---|
| \`onLoadStarted\` | None | When a load starts: the first load, every view switch and every \`reload()\`. |
| \`onLoaded\` | \`provider: IDataProvider\` | When a load is done. Its provider is now the one shown, and every part mounts anew on it. |
| \`onLoadFailed\` | \`error: unknown\` | When a load fails. The provider shown before, if any, stays, and the error shows in place of the parts. |
| \`onDestroyed\` | None | As the control unmounts. |

{{story: Watch the runtime}}
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

export const WatchTheRuntime: Story = {
    name: 'Watch the runtime',
    render: () => renderStory(<WatchRuntimeExample />),
    parameters: {
        docs: {
            description: {
                story: `Every runtime event, newest first. Switch the view, press *Show won deals*, which reloads through the runtime, or *Remount* to see \`onDestroyed\` and a fresh \`onReady\`.`,
            },
        },
    },
}
