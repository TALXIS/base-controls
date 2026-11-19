import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { SHOWCASE_FILES, STORE_OPENINGS_TABS } from './storeOpeningsFiles'

export const StoreOpeningsExample = () => <GridExampleRunner seedCode={SHOWCASE_FILES} tabs={STORE_OPENINGS_TABS} />
