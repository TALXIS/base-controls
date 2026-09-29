import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const OVERVIEW_CODE = `const GridExample = () => {
    const [clicked, setClicked] = React.useState('nothing yet')

    return <Stack tokens={{ childrenGap: 8 }}>
        <span>Last clicked: <b>{clicked}</b></span>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                sorting: createSortingModule(),
            }}
            onRowClicked={record => setClicked(record.getFormattedValue('name') ?? '')}
            height='440px' />
    </Stack>
}
`

export const OverviewExample = () => <GridExampleRunner seedCode={OVERVIEW_CODE} />
