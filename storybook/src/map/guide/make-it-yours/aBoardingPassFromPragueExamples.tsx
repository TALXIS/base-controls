import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, REGION_PIN_FILE, withCapitals } from '../capitalTripFiles'

const A_BOARDING_PASS_FROM_PRAGUE_CODE = `import { DataProviderScope, IMapPoint, LeafletMap, useMap, useMapRecord, useMapRecords, useTheme } from '@talxis/base-controls'
import { FontWeights, Icon, ITheme, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { cities, FIELD_MAPPING, REGIONS } from './data'
import { REGION_PINS } from './RegionPin'

//new: where every flight starts
const HOME = 'Prague'
const CRUISE_SPEED_KMH = 800
const TAXI_AND_CLIMB_MINUTES = 30

//new: the pass's styles, banded in the region's colour
const getStyles = (theme: ITheme, color: string) => mergeStyleSets({
    pass: { width: 240, fontFamily: theme.fonts.medium.fontFamily },
    band: { padding: '8px 12px', color: '#ffffff', background: color, fontWeight: FontWeights.semibold, letterSpacing: 2, textTransform: 'uppercase' },
    route: { padding: 12 },
    code: { fontSize: 28, fontWeight: FontWeights.bold },
    facts: { padding: '0 12px 12px', color: theme.semanticColors.bodySubtext },
})

//new: great-circle distance in kilometres
const getDistance = (from: IMapPoint, to: IMapPoint) => {
    const toRadians = (degrees: number) => degrees * Math.PI / 180
    const latitude = toRadians(to.latitude - from.latitude)
    const longitude = toRadians(to.longitude - from.longitude)
    const a = Math.sin(latitude / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitude / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

//new: the first three letters, as an airport code
const toCode = (name: string) => name.slice(0, 3).toUpperCase()

//new: the whole popup, read from the pin's record and the map
const BoardingPass = () => {
    //the app's theme, which the pass follows
    const theme = useTheme()
    const map = useMap()
    const capital = useMapRecord()
    const home = useMapRecords().find(record => record.getValue('name') === HOME)!
    const color = REGIONS.find(region => region.Value === Number(capital.getValue('region')))?.Color ?? theme.palette.themePrimary
    const styles = getStyles(theme, color)
    const kilometres = Math.round(getDistance(map.getPoint(home)!, map.getPoint(capital)!))
    const minutes = Math.round(kilometres / CRUISE_SPEED_KMH * 60) + TAXI_AND_CLIMB_MINUTES

    return <div className={styles.pass}>
        <div className={styles.band}>Boarding pass</div>
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' className={styles.route}>
            <Text className={styles.code}>{toCode(HOME)}</Text>
            <Icon iconName='Airplane' />
            <Text className={styles.code}>{toCode(capital.getFormattedValue('name'))}</Text>
        </Stack>
        <Text block className={styles.facts}>{kilometres.toLocaleString()} km, {Math.floor(minutes / 60)}h {minutes % 60}m</Text>
    </div>
}

const GridExample = () => <DataProviderScope provider={cities}>
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{
        marker: {
            pin: REGION_PINS,
            //new: the boarding pass in place of the postcard
            popup: { onRender: () => <BoardingPass /> },
        },
    }} />
</DataProviderScope>
`

export const ABoardingPassFromPragueExample = () => <GridExampleRunner seedCode={withCapitals(A_BOARDING_PASS_FROM_PRAGUE_CODE, citiesFile(['population', 'region']), REGION_PIN_FILE)} tabs={CAPITAL_TABS} />
