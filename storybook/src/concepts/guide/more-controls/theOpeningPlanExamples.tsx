import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { STORE_FORM_WITH_PLAN_FILE, STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const PLAN_SECTION = "        <Form.Section label='Opening plan'>"

if (!STORE_FORM_WITH_PLAN_FILE.code.includes(PLAN_SECTION)) {
    throw new Error(`STORE_FORM_WITH_PLAN_FILE no longer holds "${PLAN_SECTION.trim()}"`)
}

const STORE_FORM_WITH_NEW_PLAN_FILE: IGridExampleFile = {
    name: STORE_FORM_WITH_PLAN_FILE.name,
    code: STORE_FORM_WITH_PLAN_FILE.code.replace(PLAN_SECTION, "        {/* new: the store's own TaskDatasetControl */}\n" + PLAN_SECTION),
}

const THE_OPENING_PLAN_FILES = withFinishedApp(STORE_FORM_WITH_NEW_PLAN_FILE)

export const TheOpeningPlanExample = () => <GridExampleRunner seedCode={THE_OPENING_PLAN_FILES} tabs={STORE_OPENINGS_TABS} />
