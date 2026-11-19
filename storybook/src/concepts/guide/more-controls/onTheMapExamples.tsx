import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_FORM_FILE, STORE_MAP_FILE, STORE_OPENINGS_CODE, STORE_OPENINGS_TABS, STORES_RIBBON_FILE, withStoreOpenings } from '../storeOpeningsFiles'

//marks the lines this step adds to the finished entry
const NEW_LINES: [string, string][] = [
    ['//what a view draws', '//new: what a view draws'],
    ["    { id: 'map'", "    //new: draws the stores as pins\n    { id: 'map'"],
    ['    const isMap', "    //new: the open view's data says what to draw\n    const isMap"],
    ['{/* only the grid', '{/* new: only the grid'],
    ['{/* both draw', '{/* new: both draw'],
]

const ON_THE_MAP_CODE = NEW_LINES.reduce((code, [line, marked]) => {
    if (!code.includes(line)) {
        throw new Error(`STORE_OPENINGS_CODE no longer holds "${line}"`)
    }
    return code.replace(line, marked)
}, STORE_OPENINGS_CODE)

const ON_THE_MAP_FILES = withStoreOpenings(ON_THE_MAP_CODE, STORES_RIBBON_FILE, STORE_FORM_FILE, STORE_MAP_FILE)

export const OnTheMapExample = () => <GridExampleRunner seedCode={ON_THE_MAP_FILES} tabs={STORE_OPENINGS_TABS} />
