import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const PIECES_AND_SLOTS_CODE = `import { IRibbonCommand, IRibbonComponents, Ribbon, RibbonUiShimmerComponents, RibbonUiCommandBarComponents } from '@talxis/base-controls'
import { DefaultButton, Stack } from '@fluentui/react'

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const loadCommands = async (): Promise<IRibbonCommand[]> => {
    await callServer(2000)
    return [
        { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => callServer(1000) },
        { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => callServer(1000) },
    ]
}

const components: IRibbonComponents = {
    //a piece: the slots of the ribbon's command bar
    commandBar: {
        //draws the default command bar with one prop changed
        onRender: props => RibbonUiCommandBarComponents.onRender({ ...props, items: props.items.map(item => ({ ...item, iconOnly: true })) }),
    },
    //a piece: the slots of the shimmer the ribbon shows while it loads
    shimmer: {
        //draws the default shimmer, as wide as the two icon-only commands
        onRender: props => RibbonUiShimmerComponents.onRender({ ...props, width: 80 }),
    },
}

const GridExample = () => {
    const [mountKey, setMountKey] = React.useState(0)

    return <Stack tokens={{ childrenGap: 8 }} horizontalAlign='start'>
        <Ribbon key={mountKey} onLoad={loadCommands} components={components} />
        <DefaultButton text='Mount again' onClick={() => setMountKey(mountKey + 1)} />
    </Stack>
}
`

const PLAIN_UI_CODE = `import { DatasetControl, Form } from '@talxis/base-controls'
import { Dropdown, Text } from '@fluentui/react'

const STAGES = [
    { key: 1, text: 'Qualify' },
    { key: 2, text: 'Propose' },
    { key: 3, text: 'Won' },
]

interface IDeal {
    id: string
    name: string
    stage: number
    value: string
}

const VIEWS = [
    { key: 'all', text: 'All deals', matches: (deal: IDeal) => true },
    { key: 'won', text: 'Won deals', matches: (deal: IDeal) => deal.stage === 3 },
]

//plain data in your own state: no provider, no runtime
const DEALS: IDeal[] = [
    { id: 'contoso', name: 'Contoso: CRM rollout', stage: 1, value: '$4,000' },
    { id: 'fabrikam', name: 'Fabrikam: Support renewal', stage: 2, value: '$21,500' },
    { id: 'adventure', name: 'Adventure Works: Licences', stage: 3, value: '$26,500' },
]

//the form's section and cells as plain UI
const DealCard = (props: { deal: IDeal, onChange: (deal: IDeal) => void }) => <Form.Ui.Section label={props.deal.name} cellLabelPosition='Top'>
    <Form.Ui.Cell label='Stage'>
        <Dropdown options={STAGES} selectedKey={props.deal.stage} onChange={(_, option) => props.onChange({ ...props.deal, stage: Number(option!.key) })} />
    </Form.Ui.Cell>
    <Form.Ui.Cell label='Value'>
        <Text>{props.deal.value}</Text>
    </Form.Ui.Cell>
</Form.Ui.Section>

const GridExample = () => {
    const [deals, setDeals] = React.useState(DEALS)
    const [view, setView] = React.useState(VIEWS[0])

    //the DatasetControl's frame and view switcher, drawn as plain UI from your own state
    return <DatasetControl.Ui.Container>
        <DatasetControl.Ui.Header>
            <DatasetControl.Ui.HeaderStart>
                <DatasetControl.Ui.ViewSwitcher
                    text={view.text}
                    selectedKey={view.key}
                    items={VIEWS.map(option => ({ key: option.key, text: option.text, onClick: () => setView(option) }))} />
            </DatasetControl.Ui.HeaderStart>
        </DatasetControl.Ui.Header>
        <DatasetControl.Ui.Body>
            <Form.Ui.Tab id='board'>
                {deals.filter(view.matches).map(deal => <Form.Ui.Column key={deal.id}>
                    <DealCard deal={deal} onChange={changed => setDeals(deals.map(other => other.id === changed.id ? changed : other))} />
                </Form.Ui.Column>)}
            </Form.Ui.Tab>
        </DatasetControl.Ui.Body>
    </DatasetControl.Ui.Container>
}
`

export const PiecesAndSlotsExample = () => <GridExampleRunner seedCode={PIECES_AND_SLOTS_CODE} tabs={['preview', 'code']} />
export const PlainUiExample = () => <GridExampleRunner seedCode={PLAIN_UI_CODE} tabs={['preview', 'code']} />
