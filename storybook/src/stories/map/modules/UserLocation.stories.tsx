import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createEditingModule } from '@talxis/base-controls/components/Map/modules/editing'
import { createUserLocationModule, resolveLocationFromIpAddress } from '@talxis/base-controls/components/Map/modules/user-location'
import { MapDemo } from '../../../map/MapDemo'
import { createSampleDataset, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
With no pins to fit, the map opens on its default centre. The user location module centres it on the
**user** instead: the browser is asked first, because it is the only source precise enough to drop a pin on,
and the map zooms in close when it answers. A user who declines, or a browser with nothing to say, falls
through to \`resolveFallback\` - \`resolveLocationFromIpAddress\` is an opt-in lookup on a public service -
and the map stays zoomed out, because that answer is only good to a city.

\`\`\`tsx
modules={{ userLocation: createUserLocationModule({ resolveFallback: resolveLocationFromIpAddress }) }}
\`\`\`

Nothing is asked until the dataset has answered with nothing to draw, so a slow dataset never shows a
permission prompt over pins that were about to arrive. The module is opt in for the same reason it is off
here until you turn it on: it prompts for permission, and a map on a page has no business asking unless the
host meant it to.
`

interface IUserLocationProps {
    centreOnUser: boolean
}

const UserLocation = (props: IUserLocationProps) => {
    const dataset = useMemo(() => createSampleDataset({ records: [] }), [])
    const modules = useMemo(() => ({
        //pin creation is on either way, so the map is a usable starting point rather than an empty one
        editing: createEditingModule({ allowCreate: true }),
        ...(props.centreOnUser ? { userLocation: createUserLocationModule({ resolveFallback: resolveLocationFromIpAddress }) } : {})
    }), [props.centreOnUser])
    return (
        <MapDemo
            dataset={dataset}
            modules={modules}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                DefaultProvider: { raw: 'osm' }
            }}
        />
    )
}

const meta = {
    title: 'Map/Modules/User location',
    component: UserLocation,
    tags: ['autodocs'],
    argTypes: {
        centreOnUser: {
            control: 'boolean',
            description: 'Adds the module. It asks the browser for permission, so it starts off here.'
        }
    },
    //a docs page renders every story it has, so nothing on it may ask where you are until you ask it to
    args: { centreOnUser: false },
    parameters: mapStoryParameters(INTRO)
} satisfies Meta<typeof UserLocation>

export default meta
type Story = StoryObj<typeof meta>

export const CentreOnTheUser: Story = {
    name: 'Centre on the user when there is nothing to fit',
    parameters: {
        docs: {
            description: {
                story: [
                    '**Turn the switch on** to add the module: the browser asks where you are, and the map moves',
                    'there. Decline, and the IP lookup places you roughly instead. Click to place the first record;',
                    'once there is a pin, the pins decide where the map looks again.'
                ].join(' ')
            }
        }
    }
}
