import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useMemo, useState } from 'react'
import { createCardsModule, IMapCardRule } from '@talxis/base-controls/components/Map/modules/cards'
import { ADAPTIVE_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/adaptive-card'
import { FORM_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/form-card'
import { createClusteringModule } from '@talxis/base-controls/components/Map/modules/clustering'
import { createEditingModule } from '@talxis/base-controls/components/Map/modules/editing'
import { MapDemo } from '../../../map/MapDemo'
import { IExecutedFunction, IMapHostShimOptions, installMapHostShim } from '../../../map/mapHostShim'
import { ADAPTIVE_CARD_TEMPLATE, PIN_RULES, SITE_CARD_FORM_ID, SITE_CARD_FORM_XML } from '../../../map/mapSampleConfig'
import { createSampleDataset, getSiteRecords, getSiteRecordsWithFormattedValues, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters, StoryNote } from '../storyHelpers'

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

const INTRO = `
What a pin **opens** when it is activated. Without this module a click selects the record and nothing more;
with it, one card is open at a time, anchored on its pin by whichever provider is drawing.

\`\`\`tsx
modules={{ cards: createCardsModule() }}
modules={{ cards: createCardsModule({ defaultCard: { type: 'fields', columns: ['name', 'city'] } }) }}
\`\`\`

Which card a record opens is decided by **rules**, matched exactly like the pin rules - so "depots open an
Adaptive Card, service points run a function" is a list of rules rather than a code path. Each rule says
what activating a pin does - \`fields\`, \`adaptiveCard\`, \`function\` or \`none\` - plus whatever that type
needs. A type of your own is a renderer of your own, passed through \`renderers\`.

A grouped pin (the clustering module) opens a list of the records behind it, one row per record, and a
record the editing module created gets a **Delete** button on its card.
`

const meta = {
    title: 'Map/Modules/Cards',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Shows what the control asked the host to run, so an ExecuteFunction button has something to prove. */
const useHostShim = (options: IMapHostShimOptions = {}) => {
    const [executed, setExecuted] = useState<IExecutedFunction[]>([])
    useEffect(() => {
        const shim = installMapHostShim({
            ...options,
            onExecute: (entry) => {
                options.onExecute?.(entry)
                setExecuted((current) => [...current, entry])
            }
        })
        return shim.restore
    }, [])
    return executed
}

const ExecutedNote = ({ executed, hint }: { executed: IExecutedFunction[]; hint: string }) => (
    <StoryNote>
        ExecuteFunction calls: {executed.length
            ? executed.map((entry) => `${entry.functionName}(${entry.args[0]?.recordId})`).join(', ')
            : `none yet - ${hint}`}
    </StoryNote>
)

const FIELDS_CARD = {
    cards: createCardsModule({
        defaultCard: {
            type: 'fields',
            columns: ['name', 'category', 'city', 'address', 'capacity'],
            actions: [
                { label: 'Plan a visit', webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.planVisit' },
                { label: 'Open record', webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.openRecord' }
            ]
        }
    })
}

const FieldsCard = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    const executed = useHostShim()
    return (
        <MapDemo dataset={dataset} modules={FIELDS_CARD} parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}>
            <ExecutedNote executed={executed} hint="open a pin and press a button" />
        </MapDemo>
    )
}

export const DetailCard: Story = {
    name: 'A card on pin click',
    render: () => <FieldsCard />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Clicking a pin opens one card, and opening another closes it. The built-in card shows the',
                    'attributes the definition names, read through the same dot-notation resolver as every other',
                    'binding, and renders the buttons it was given. A button runs a function in a web resource',
                    'through `ExecuteFunction`; this page installs a stand-in for the Dataverse host so you can see',
                    'what it would have called.'
                ].join(' ')
            }
        }
    }
}

const ADAPTIVE_CARD = {
    cards: createCardsModule({
        defaultCard: { type: 'adaptiveCard', template: ADAPTIVE_CARD_TEMPLATE },
        renderers: ADAPTIVE_MAP_CARD_RENDERERS
    })
}

const AdaptiveCards = () => {
    //carries the annotation an Adaptive Card cannot bind until the control renames it
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecordsWithFormattedValues() }), [])
    const executed = useHostShim()
    return (
        <MapDemo dataset={dataset} modules={ADAPTIVE_CARD} parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}>
            <ExecutedNote executed={executed} hint="open a pin and press Plan a visit" />
        </MapDemo>
    )
}

export const AdaptiveCard: Story = {
    name: 'An Adaptive Card instead',
    render: () => <AdaptiveCards />,
    parameters: {
        docs: {
            description: {
                story: [
                    'The same click rendered through an Adaptive Card template. The renderer lives behind its own',
                    'entry point, so `adaptivecards` and `adaptivecards-templating` stay optional peer dependencies',
                    'and a consumer who renders cards from record columns never installs a card engine:',
                    '',
                    '```tsx',
                    "import { ADAPTIVE_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/adaptive-card';",
                    '',
                    "createCardsModule({ defaultCard: { type: 'adaptiveCard', template }, renderers: ADAPTIVE_MAP_CARD_RENDERERS })",
                    '```',
                    '',
                    'Note the **Capacity** fact: it binds `${$root.capacity_label}`. The record holds that value',
                    'under `capacity@OData.Community.Display.V1.FormattedValue`, which no Adaptive Cards binding',
                    'expression can address - so the module renames every annotation before expanding the template,',
                    'exactly as the legacy MapPicker did, and copies rather than mutates so the dataset is untouched.'
                ].join('\n')
            }
        }
    }
}

const RULES: IMapCardRule[] = [
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'depot', type: 'adaptiveCard', template: ADAPTIVE_CARD_TEMPLATE },
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'service', type: 'function', webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.openServicePoint' },
    { type: 'fields', columns: ['name', 'city', 'capacity'] }
]

const RULED = {
    cards: createCardsModule({ rules: RULES, renderers: ADAPTIVE_MAP_CARD_RENDERERS })
}

const RuledCards = () => {
    //the depots' Adaptive Card binds the capacity's formatted value, so the records have to carry it
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecordsWithFormattedValues() }), [])
    const executed = useHostShim()
    return (
        <MapDemo dataset={dataset} modules={RULED} parameters={{ ...COORDINATES, PinRules: { raw: PIN_RULES }, DefaultProvider: { raw: 'osm' } }}>
            <ExecutedNote executed={executed} hint="click a green service point" />
        </MapDemo>
    )
}

export const CardRules: Story = {
    name: 'A different card per category',
    render: () => <RuledCards />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Three rules: red depots open an Adaptive Card, green service points run a function instead of',
                    'showing anything, and everything else opens a short fields card. Rules are tried in order and',
                    'the first match wins, so the entry with no `attributeName` is the fallback and belongs last.'
                ].join(' ')
            }
        }
    }
}

const FORM_CARD = {
    cards: createCardsModule({
        defaultCard: {
            type: 'form',
            formId: SITE_CARD_FORM_ID,
            webResourceName: 'ntg_map.js',
            functionName: 'TALXIS.Map.onSiteFormLoad'
        },
        renderers: FORM_MAP_CARD_RENDERERS
    })
}

/** What the form's load handler in `ntg_map.js` would do: read an attribute and talk to the form through `formContext`. */
const onSiteFormLoad = (entry: IExecutedFunction) => {
    const formContext = entry.args[0]?.formContext
    if (entry.functionName !== 'TALXIS.Map.onSiteFormLoad' || !formContext) {
        return
    }
    const capacity = formContext.getAttribute('capacity')?.getValue() ?? 0
    formContext.ui.setFormNotification(
        capacity >= 500 ? `A large site: ${capacity} pallets.` : `A small site: ${capacity} pallets.`,
        'INFO',
        'capacity'
    )
}

/** The Dataverse forms this page answers `Xrm.WebApi` with. */
const HOST_FORMS = { [SITE_CARD_FORM_ID]: SITE_CARD_FORM_XML }

const FormCards = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    const executed = useHostShim({ forms: HOST_FORMS, onExecute: onSiteFormLoad })
    return (
        <MapDemo dataset={dataset} modules={FORM_CARD} parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}>
            <ExecutedNote executed={executed} hint="open a pin" />
        </MapDemo>
    )
}

export const FormCard: Story = {
    name: 'A Form base control instead',
    render: () => <FormCards />,
    parameters: {
        docs: {
            description: {
                story: [
                    'The same click rendered through the Form base control\'s `XrmForm`, laid out by FormXml.',
                    'The card names a `systemform` by `formId` and reads its FormXml through `Xrm.WebApi`, so a',
                    'maker points the map at a form they already designed; `formXml` takes the XML inline instead.',
                    'Like Adaptive Cards, the renderer sits behind its own entry point, so only a map that uses it',
                    'pulls the Form control into its build:',
                    '',
                    '```tsx',
                    "import { FORM_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/form-card';",
                    '',
                    "createCardsModule({",
                    "    defaultCard: { type: 'form', formId, webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.onSiteFormLoad' },",
                    "    renderers: FORM_MAP_CARD_RENDERERS",
                    "})",
                    '```',
                    '',
                    'On a form card, `webResourceName` and `functionName` are the form\'s load handler. It is called',
                    'with the record and its `formContext` once the form has its data, as a form\'s OnLoad handler',
                    'would be - here it reads **Capacity** and posts a form notification. This page stands in for',
                    'the Dataverse host, answering `Xrm.WebApi` with one sample form. Edits made on the card stay on',
                    'the card; it shows the record, it does not save it.'
                ].join('\n')
            }
        }
    }
}

const GROUPED = {
    clustering: createClusteringModule(),
    cards: createCardsModule({ defaultCard: { type: 'fields', columns: ['name', 'category', 'capacity'] } })
}

const GroupedCard = () => {
    const dataset = useMemo(() => createSampleDataset({
        //six warehouses on one site, among the rest of the country - so the map fits wide and they overlap
        records: [
            ...Array.from({ length: 6 }, (_, index) => ({
                name: `Praha warehouse ${index + 1}`,
                category: index % 2 ? 'store' : 'depot',
                city: 'Praha',
                address: `Kolbenova ${900 + index}, 190 00 Praha 9`,
                capacity: 100 + index * 40,
                openedOn: `202${index}-03-01`,
                lat: 50.1038 + index * 0.0004,
                lng: 14.4806 + index * 0.0004
            })),
            ...getSiteRecords().filter((record) => record.city !== 'Praha')
        ]
    }), [])
    return (
        <MapDemo dataset={dataset} modules={GROUPED} parameters={{ ...COORDINATES, PinRules: { raw: PIN_RULES }, DefaultProvider: { raw: 'osm' } }} />
    )
}

export const GroupedPins: Story = {
    name: 'The card of a grouped pin',
    render: () => <GroupedCard />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Six warehouses on one Praha site, drawn as a single pin carrying the count. Clicking it opens',
                    'a card listing every record behind it - one row per record, its pin and primary name, or',
                    'whatever `components.onRenderClusterMember` draws - with a button to zoom to where the group comes',
                    'apart. Picking a row shows that record\'s own card in the same place, with a way back to the',
                    'list; a record\'s card, which may be expensive to bring up, is rendered only for the record',
                    'the user picked.'
                ].join(' ')
            }
        }
    }
}

const EDITABLE = {
    editing: createEditingModule({ allowCreate: true }),
    cards: createCardsModule({ defaultCard: { type: 'fields', columns: ['lat', 'lng'] } })
}

const DeletableCards = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords().slice(0, 3) }), [])
    return (
        <MapDemo dataset={dataset} modules={EDITABLE} parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }} />
    )
}

export const DeleteFromCard: Story = {
    name: 'Deleting a record the map created',
    render: () => <DeletableCards />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Cards and editing together. Click empty map to create a record, then open its pin: the card',
                    'carries a **Delete** button, offered only for records this map created. The three records the',
                    'dataset came with open a card without one.'
                ].join(' ')
            }
        }
    }
}
