import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const SELECTED_VALUE_CODE = `import { useProvideDatasetControlPart } from '@talxis/base-controls'
import { loadDeals } from './views'

const getTotal = (provider: IDataProvider): number => provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id]?.getValue('value') ?? 0), 0)

//a part of your own: the total value of the selected deals
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    //for control.parts.get('selectedValue'), under the key types.ts declares
    useProvideDatasetControlPart('selectedValue', () => ({ getTotal: () => getTotal(provider) }))
    const total = getTotal(provider)
    return <Text styles={{ root: { alignSelf: 'center' } }}>Selected: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

const GridExample = () => <DatasetControl stateKey='selectedValue' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid stateKey='grid' modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <SelectedValue />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

const SELECTED_VALUE_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//declares the key SelectedValue registers its part under, next to the part in your project
export interface ISelectedValue {
    getTotal(): number
}

declare module '@talxis/base-controls' {
    interface IDatasetControlPartMap {
        selectedValue: ISelectedValue
    }
}
`,
}

export const SelectedValueExample = () => <GridExampleRunner seedCode={withFiles(SELECTED_VALUE_CODE, VIEWS_FILE, SELECTED_VALUE_TYPES_FILE)} tabs={['preview', 'code']} />
