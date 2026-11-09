import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { withFiles } from './shared'

const SELECTED_VALUE_CODE = `import { useProvideDatasetControlPart } from '@talxis/base-controls'

const getTotal = (provider: IDataProvider): number => provider.getSelectedRecordIds().reduce((sum, id) => sum + provider.getRecordsMap()[id].getValue('value'), 0)

//a part of your own: the total value of the selected deals
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    //for control.parts.get('selectedValue'), under the key types.ts declares
    useProvideDatasetControlPart('selectedValue', () => ({ getTotal: () => getTotal(provider) }))
    return <Text>Selected: {getTotal(provider).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} height='480px'>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
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
    code: `//declares the key SelectedValue provides its part under, next to the part in your project
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

export const SelectedValueExample = () => <GridExampleRunner seedCode={withFiles(SELECTED_VALUE_CODE, SELECTED_VALUE_TYPES_FILE)} tabs={['preview', 'code']} />
