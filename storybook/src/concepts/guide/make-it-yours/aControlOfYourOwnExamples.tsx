import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const STORE_FORM_WITH_FORECAST_FILE: IGridExampleFile = {
    name: 'StoreForm.tsx',
    code: `import { Form } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { FootfallForecast } from './FootfallForecast'
import { OpeningPlan } from './OpeningPlan'

//edits the same record the list shows
export const StoreForm = (props: { store: IRecord }) => {
    //one field per column the list shows after Edit columns
    const columns = props.store.getColumns().filter(column => !column.isHidden)

    return <Form.Root onLoad={async () => ({ record: props.store })}>
        <Form.Ribbon />
        <Form.Section label='Details' layout={{ lg: 2 }} cellLabelPosition='Top'>
            {columns.map(column => <Form.Field key={column.name} name={column.name}>
                <Form.Cell><Form.Control /></Form.Cell>
            </Form.Field>)}
        </Form.Section>
        {/* new: a control of your own in a section of the form */}
        <Form.Section label='Forecast'>
            <FootfallForecast storeId={props.store.getRecordId()} />
        </Form.Section>
        <Form.Section label='Opening plan'>
            <OpeningPlan store={props.store} />
        </Form.Section>
    </Form.Root>
}
`,
}

const FOOTFALL_FORECAST_FILE: IGridExampleFile = {
    name: 'FootfallForecast.tsx',
    code: `import { Runtime, RuntimeHost, useRuntime } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { STORES } from './stores'

let calls = 0

//stands in for a forecast service that fails every second call
const fetchForecast = async (storeId: string) => {
    await new Promise(resolve => setTimeout(resolve, 900))
    calls++
    if (calls % 2 === 0) {
        throw new Error('The forecast service did not respond.')
    }
    return STORES.find(store => store.storeid === storeId)!.seats * 9
}

//one for each mount of the control
class ForecastRuntime extends Runtime {
    private _storeId: string
    private _visitors = 0

    constructor(storeId: string) {
        super()
        this._storeId = storeId
    }

    public getVisitors(): number {
        return this._visitors
    }

    //a throw here shows the error with Try again
    protected async onInit(): Promise<void> {
        this._visitors = await fetchForecast(this._storeId)
    }

    protected onDestroy(): void { }
}

//drawn once the forecast has loaded
const Forecast = () => <Text variant='large'>About {useRuntime<ForecastRuntime>().getVisitors()} visitors a day</Text>

export const FootfallForecast = (props: { storeId: string }) => <RuntimeHost createRuntime={() => new ForecastRuntime(props.storeId)}>
    <Forecast />
</RuntimeHost>
`,
}

export const AControlOfYourOwnExample = () => <GridExampleRunner seedCode={withFinishedApp(STORE_FORM_WITH_FORECAST_FILE, FOOTFALL_FORECAST_FILE)} tabs={STORE_OPENINGS_TABS} />
