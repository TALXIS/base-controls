import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useMemo, useState } from 'react'
import type { IRecord } from '@talxis/client-libraries'
import { createClientApiModule, IMapClientApi } from '@talxis/base-controls/components/Map/modules/client-api'
import { MapDemo } from '../../../map/MapDemo'
import { installMapHostShim } from '../../../map/mapHostShim'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters, StoryNote } from '../storyHelpers'

const INTRO = `
Pin rules a maker can type cover "depots are red". Anything that has to look at a related record, compute a
value, or decide in JavaScript is a **Client API web resource**: the module runs the function it names once,
with the dataset and the registration methods, exactly as the dataset control's own Client API is run - so
a customizer writes the same kind of web resource for both.

\`\`\`tsx
modules={{ clientApi: createClientApiModule({ webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.onLoad' }) }}
\`\`\`

\`\`\`js
// ntg_map.js
TALXIS.Map.onLoad = (api) => {
    api.setPinResolver((record) => record.getValue('capacity') > 500 ? { color: '#c50f1f', title: 'Over capacity' } : undefined);
};
\`\`\`

The resolver sits between the wrapper's own \`onResolvePin\` and the \`PinRules\` parameter: code first, then
whatever the web resource registered, then the rules - and anything returning nothing falls through.
`

const meta = {
    title: 'Map/Modules/Client API',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** What the web resource on this page would do: mark the sites over capacity. */
const onLoad = (api: IMapClientApi) => {
    api.setPinResolver((record: IRecord) =>
        Number(record.getValue('capacity')) > 500 ? { color: '#c50f1f', title: 'Over capacity' } : undefined)
}

const MODULES = { clientApi: createClientApiModule({ webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.onLoad' }) }

const ClientApi = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    const [ran, setRan] = useState(false)
    useEffect(() => {
        //storybook is not a model-driven app, so this stands in for the host running the web resource
        const shim = installMapHostShim({
            onExecute: (entry) => {
                if (entry.functionName === 'TALXIS.Map.onLoad') {
                    onLoad(entry.args[0])
                    setRan(true)
                }
            }
        })
        return shim.restore
    }, [])
    return (
        <MapDemo dataset={dataset} modules={MODULES} parameters={{
            LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
            LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
            DefaultProvider: { raw: 'osm' }
        }}>
            <StoryNote>web resource: {ran ? 'TALXIS.Map.onLoad ran and registered a pin resolver' : 'not run yet'}</StoryNote>
        </MapDemo>
    )
}

export const WebResource: Story = {
    name: 'A web resource deciding the pins',
    render: () => <ClientApi />,
    parameters: {
        docs: {
            description: {
                story: [
                    'This page installs a stand-in for the Dataverse host, whose `executeFunction` runs the function',
                    'above. The two depots over capacity turn red; everything else keeps the default pin, because',
                    'the resolver returned nothing for it.'
                ].join(' ')
            }
        }
    }
}
