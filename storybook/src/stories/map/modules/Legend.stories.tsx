import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createLegendModule } from '@talxis/base-controls/components/Map/modules/legend'
import { MapDemo } from '../../../map/MapDemo'
import { LEGEND_HTML, PIN_RULES } from '../../../map/mapSampleConfig'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
A map whose pins mean something needs a key to that meaning, and only the host knows what it says. The
legend module takes markup and shows it over the map, collapsible, beside the provider picker.
\`webResourceName\` loads the same markup from a web resource instead, which is how a legend is maintained
without redeploying the wrapper; it wins over \`html\` once it loads.

This is the one place the Map renders markup it did not write, so **it is cleaned first**. Scripts, event
handler attributes and anything that can load or submit are removed; formatting, tables, images, links and
inline SVG survive, and a surviving link is rewritten to open detached from the app.

\`\`\`tsx
modules={{ legend: createLegendModule({ html: legendHtml }) }}
\`\`\`
`

const meta = {
    title: 'Map/Modules/Legend',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The markup above plus the two things the control must refuse to run. */
const LEGEND_WITH_ATTACKS = `${LEGEND_HTML}
<p><a href="https://www.openstreetmap.org/copyright">About this data</a></p>
<script>window.legendWasExecuted = true</script>
<img src="x" onerror="window.legendWasExecuted = true">
`

const MODULES = { legend: createLegendModule({ html: LEGEND_WITH_ATTACKS }) }

const Legend = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={MODULES}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                PinRules: { raw: PIN_RULES },
                DefaultProvider: { raw: 'osm' }
            }}
        />
    )
}

export const HtmlLegend: Story = {
    name: 'A legend over the map',
    render: () => <Legend />,
    parameters: {
        docs: {
            description: {
                story: [
                    'The legend button sits in the top-right corner, under the provider picker when there is one;',
                    'open it to see the key, and note that the swatches are inline SVG rather than images, so',
                    'nothing is fetched to draw them.',
                    '',
                    'The markup on this page deliberately ends with a `<script>` and an `<img src="x" onerror=…>`.',
                    'Neither runs - open the console and check `window.legendWasExecuted`, which stays undefined.',
                    'The broken image icon under the link is that `<img>`: the element survived because images are',
                    'legitimate legend content, its handler did not, and the source was never going to load. The',
                    'heading, the list, the styles and the link all survive too.'
                ].join(' ')
            }
        }
    }
}
