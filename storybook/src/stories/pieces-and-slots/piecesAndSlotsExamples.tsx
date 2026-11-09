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
    //a slot of the ribbon itself: draws its default with one prop changed
    onRenderCommandBar: props => RibbonUiCommandBarComponents.onRenderCommandBar({ ...props, items: props.items.map(item => ({ ...item, iconOnly: true })) }),
    //a piece: the slots of the shimmer the ribbon shows while it loads
    shimmer: {
        //draws the default shimmer, as wide as the two icon-only commands
        onRenderShimmer: props => RibbonUiShimmerComponents.onRenderShimmer({ ...props, width: 80 }),
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

export const PiecesAndSlotsExample = () => <GridExampleRunner seedCode={PIECES_AND_SLOTS_CODE} tabs={['preview', 'code']} />
