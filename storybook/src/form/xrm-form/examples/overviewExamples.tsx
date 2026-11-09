import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { accountDataFile, DETAILS_TAB, formXmlFile, ITabSpec } from './shared'

const OVERVIEW_CODE = `import { createMemoryRecord, XrmForm } from '@talxis/base-controls'
import { ACCOUNT, COLUMNS } from './account'
import { FORM_XML } from './formXml'

//runs at mount, and again on reload
const onLoad = async () => ({
    //a record held in memory
    record: createMemoryRecord({ columns: COLUMNS, data: ACCOUNT, metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' } }),
    formXml: FORM_XML,
})

const GridExample = () => <XrmForm onLoad={onLoad} />
`

const TABS: ITabSpec[] = [
    {
        name: 'summary',
        label: 'Summary',
        columns: [
            { width: '65%', sections: [{ name: 'account_information', label: 'Account information', columns: '11', fields: ['name', 'industrycode', 'telephone1'] }] },
            { width: '35%', sections: [{ name: 'status', label: 'Status', fields: ['creditonhold'] }] },
        ],
    },
    DETAILS_TAB,
]

export const XrmOverviewExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OVERVIEW_CODE }, formXmlFile(TABS), accountDataFile(TABS)]} tabs={['preview', 'code']} />
