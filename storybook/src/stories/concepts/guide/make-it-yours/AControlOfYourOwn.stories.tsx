import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { AControlOfYourOwnExample } from '../../../../concepts/guide/make-it-yours/aControlOfYourOwnExamples'

const STEP = 'A control of your own'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: each store's form shows a footfall forecast from a service of your own. While it loads, when it fails and when the user tries again, it behaves as the library's controls do.

{{canvas: A control of your own}}

## How it works

The app is the one from [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview), and only *StoreForm.tsx* changes. In **Code**, the new section carries \`{/* new: … */}\`, and *FootfallForecast.tsx* is new. A **runtime** is the object behind one mount of a control: it loads what the control needs before the control draws. \`RuntimeHost\` makes one for each mount, shows a placeholder while it loads, and shows a failed load with **Try again**, which mounts a new one.

| In *FootfallForecast.tsx* | Is |
|---|---|
| \`fetchForecast\` | Stands in for your service: after 900 ms it forecasts nine visitors a day for each seat, and every second call fails |
| \`ForecastRuntime\` | The runtime: it extends \`Runtime\`, and its \`onInit\` loads the forecast and throws when the service fails |
| \`Forecast\` | What the control draws, once the runtime is ready; it reads the runtime with \`useRuntime()\` |
| \`FootfallForecast\` | The control: a \`RuntimeHost\` that makes a \`ForecastRuntime\` for the store |

The forecast is a component like any other, so it sits in a section of the form. Everything a runtime does, from its status and events to the actions it runs, is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). For a part of your own inside a DatasetControl, which reads the control's records, see [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview) in the DatasetControl guide.

## Try it

- Open *Lyon Part-Dieu*: *Forecast* shows a placeholder, then *About 414 visitors a day*.
- Close it and open *Porto Ribeira*: the service fails, and *Forecast* shows the error with **Try again**.
- Click **Try again**: *About 342 visitors a day*.

## Remember

- A runtime loads what your control needs; \`RuntimeHost\` draws the rest around it.
- Your control gets the placeholder, the failure and **Try again** as the library's do.

You have built the whole app. To go further with one control, follow its own guide: [**DatasetControl**](?path=/docs/controls-datasetcontrol-overview--overview), [**Grid**](?path=/docs/controls-grid-overview--overview), [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview) or [**Map**](?path=/docs/controls-map-overview--overview). Every concept page and control is on [**Introduction**](?path=/docs/concepts-introduction--overview).

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Make it yours/A control of your own',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AControlOfYourOwn: Story = {
    name: 'A control of your own',
    tags: ['!dev'],
    render: () => renderStory(<AControlOfYourOwnExample />),
}
