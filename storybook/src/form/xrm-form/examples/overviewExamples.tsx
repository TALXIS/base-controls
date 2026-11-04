import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { FORM_XML_FILE, OVERVIEW_ACCOUNT_CODE } from './shared'

const OVERVIEW_CODE = `import { createMemoryRecord, XrmForm } from '@talxis/base-controls'
import { ACCOUNT, COLUMNS } from './account'
import { FORM_XML } from './formXml'

//runs on mount and on refresh
const onLoad = async () => ({
    //a record held in memory
    record: createMemoryRecord({ columns: COLUMNS, data: ACCOUNT, metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' } }),
    formXml: FORM_XML,
})

const GridExample = () => <XrmForm onLoad={onLoad} />
`

const OVERVIEW_FILES = [
    { name: 'GridExample.tsx', code: OVERVIEW_CODE },
    FORM_XML_FILE,
    { name: 'account.ts', code: OVERVIEW_ACCOUNT_CODE },
]

export const XrmOverviewExample = () => <GridExampleRunner seedCode={OVERVIEW_FILES} tabs={['preview', 'code']} />
