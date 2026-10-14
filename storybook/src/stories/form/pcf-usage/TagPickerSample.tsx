import React from 'react'
import { PublishedPcfForm } from './PublishedPcfForm'
import formXml from './TagPicker.form.xml?raw'
import { createTagPickerData, initialTagPickerValue } from './tagPickerData'

export const TagPickerSample = () => <PublishedPcfForm
    name="TagPicker"
    xml={formXml}
    controlName="talxis_TALXIS.PCF.TagPicker"
    parameter="binding"
    initialValue={initialTagPickerValue}
    createData={createTagPickerData}
/>