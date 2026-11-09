import { Dataset, DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'

export interface ISampleSite {
    name: string
    lat: number
    lng: number
    /** Drives the conditional pin rules and the filter panel. */
    category: 'depot' | 'store' | 'service'
    /** Full postal address, for the geo-coding fallback story. */
    address: string
    city: string
    /** Groups sites into a delivery run, for the pin connection stories. */
    route?: string
    /** Order within that run. */
    stop?: number
    /** Colour of that run. */
    routeColor?: string
    capacity: number
    openedOn: string
}

/** Real places, so geo-coding and routing against the live services return something recognisable. */
export const SAMPLE_SITES: ISampleSite[] = [
    { name: 'Praha depot', lat: 50.1038678, lng: 14.4806513, category: 'depot', address: 'Kolbenova 942/38a, 190 00 Praha 9', city: 'Praha', route: 'North run', stop: 1, routeColor: '#0f6cbd', capacity: 1200, openedOn: '2019-04-01' },
    { name: 'Praha Smíchov', lat: 50.0705, lng: 14.4030, category: 'store', address: 'Plzeňská 8, 150 00 Praha 5', city: 'Praha', route: 'North run', stop: 2, routeColor: '#0f6cbd', capacity: 240, openedOn: '2021-09-15' },
    { name: 'Kladno', lat: 50.1471, lng: 14.1028, category: 'store', address: 'nám. Svobody 1961, 272 01 Kladno', city: 'Kladno', route: 'North run', stop: 3, routeColor: '#0f6cbd', capacity: 180, openedOn: '2022-02-01' },
    { name: 'Ústí nad Labem', lat: 50.6607, lng: 14.0323, category: 'service', address: 'Mírové náměstí 37, 400 01 Ústí nad Labem', city: 'Ústí nad Labem', route: 'North run', stop: 4, routeColor: '#0f6cbd', capacity: 60, openedOn: '2020-06-20' },
    { name: 'Brno depot', lat: 49.1951, lng: 16.6068, category: 'depot', address: 'Náměstí Svobody 84/15, 602 00 Brno', city: 'Brno', route: 'South run', stop: 1, routeColor: '#c50f1f', capacity: 900, openedOn: '2018-11-11' },
    { name: 'Jihlava', lat: 49.3961, lng: 15.5912, category: 'store', address: 'Masarykovo náměstí 1, 586 01 Jihlava', city: 'Jihlava', route: 'South run', stop: 2, routeColor: '#c50f1f', capacity: 150, openedOn: '2023-03-07' },
    { name: 'Olomouc', lat: 49.5938, lng: 17.2509, category: 'store', address: 'Horní náměstí 583, 779 00 Olomouc', city: 'Olomouc', route: 'South run', stop: 3, routeColor: '#c50f1f', capacity: 210, openedOn: '2021-01-25' },
    { name: 'Ostrava', lat: 49.8209, lng: 18.2625, category: 'service', address: 'Prokešovo náměstí 8, 702 00 Ostrava', city: 'Ostrava', route: 'South run', stop: 4, routeColor: '#c50f1f', capacity: 75, openedOn: '2019-08-30' },
    { name: 'Plzeň', lat: 49.7384, lng: 13.3736, category: 'store', address: 'náměstí Republiky 1, 301 00 Plzeň', city: 'Plzeň', route: 'West run', stop: 1, routeColor: '#107c10', capacity: 260, openedOn: '2020-10-05' },
    { name: 'Karlovy Vary', lat: 50.2306, lng: 12.8712, category: 'service', address: 'Moskevská 2035/21, 360 01 Karlovy Vary', city: 'Karlovy Vary', route: 'West run', stop: 2, routeColor: '#107c10', capacity: 45, openedOn: '2022-07-19' },
    { name: 'České Budějovice', lat: 48.9745, lng: 14.4743, category: 'store', address: 'náměstí Přemysla Otakara II. 1, 370 01 České Budějovice', city: 'České Budějovice', route: 'West run', stop: 3, routeColor: '#107c10', capacity: 190, openedOn: '2023-05-12' },
    { name: 'Liberec', lat: 50.7663, lng: 15.0543, category: 'store', address: 'nám. Dr. E. Beneše 1, 460 01 Liberec', city: 'Liberec', capacity: 170, openedOn: '2021-11-02' },
    { name: 'Hradec Králové', lat: 50.2092, lng: 15.8328, category: 'store', address: 'Velké náměstí 1, 500 03 Hradec Králové', city: 'Hradec Králové', capacity: 165, openedOn: '2022-04-14' },
    { name: 'Pardubice', lat: 50.0343, lng: 15.7812, category: 'service', address: 'Pernštýnské náměstí 1, 530 02 Pardubice', city: 'Pardubice', capacity: 55, openedOn: '2020-02-28' },
    { name: 'Zlín', lat: 49.2265, lng: 17.6685, category: 'store', address: 'náměstí Míru 12, 760 01 Zlín', city: 'Zlín', capacity: 140, openedOn: '2023-09-01' }
]

export const SITE_COLUMNS: IColumn[] = [
    { name: 'name', alias: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 180, isPrimary: true },
    { name: 'category', alias: 'category', displayName: 'Category', dataType: DataTypes.SingleLineText, order: 1, visualSizeFactor: 120 },
    { name: 'city', alias: 'city', displayName: 'City', dataType: DataTypes.SingleLineText, order: 2, visualSizeFactor: 140 },
    { name: 'address', alias: 'address', displayName: 'Address', dataType: DataTypes.SingleLineText, order: 3, visualSizeFactor: 260 },
    { name: 'capacity', alias: 'capacity', displayName: 'Capacity', dataType: DataTypes.WholeNumber, order: 4, visualSizeFactor: 100 },
    { name: 'openedOn', alias: 'openedOn', displayName: 'Opened on', dataType: DataTypes.SingleLineText, order: 5, visualSizeFactor: 120 },
    { name: 'route', alias: 'route', displayName: 'Route', dataType: DataTypes.SingleLineText, order: 6, visualSizeFactor: 120 },
    { name: 'stop', alias: 'stop', displayName: 'Stop', dataType: DataTypes.WholeNumber, order: 7, visualSizeFactor: 80 },
    { name: 'routeColor', alias: 'routeColor', displayName: 'Route colour', dataType: DataTypes.SingleLineText, order: 8, visualSizeFactor: 120 },
    { name: 'lat', alias: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, order: 9, visualSizeFactor: 100 },
    { name: 'lng', alias: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, order: 10, visualSizeFactor: 100 }
]

/** Attribute names the sample data holds its values under, fed to the control's static input parameters. */
export const SAMPLE_ATTRIBUTES = {
    latitude: 'lat',
    longitude: 'lng',
    address: 'address',
    category: 'category',
    route: 'route',
    stop: 'stop',
    routeColor: 'routeColor'
}

export interface ISampleDatasetOptions {
    records: IRawRecord[]
    columns?: IColumn[]
    /** Records the dataset shows at once. Anything beyond it needs the control to page. */
    pageSize?: number
    /** Columns the entity's quick find searches, which is what the map's search box uses. */
    quickFindColumns?: string[]
}

/**
 * Builds an in-memory dataset shaped like the one a PCF host would bind.
 *
 * @param options Records, columns, page size and quick find columns.
 * @returns A dataset ready to hand to the control as its `Dataset` parameter.
 */
export const createSampleDataset = (options: ISampleDatasetOptions) => {
    const metadata = {
        PrimaryIdAttribute: 'name',
        PrimaryNameAttribute: 'name',
        LogicalName: 'site',
        EntitySetName: 'sites',
        QuickFindColumns: options.quickFindColumns ?? ['name', 'city', 'address']
    }
    const provider = new MemoryDataProvider({ dataSource: options.records, metadata })
    const dataset = new Dataset(provider)
    dataset.setColumns(options.columns ?? SITE_COLUMNS)
    if (options.pageSize) {
        dataset.paging.setPageSize(options.pageSize)
    }
    void dataset.refresh()
    return dataset
}

/** The sample sites as raw records. */
export const getSiteRecords = (): IRawRecord[] => SAMPLE_SITES.map((site) => ({ ...site }))

/**
 * The sample sites with the formatted value Dataverse would send alongside their capacity, which the Adaptive
 * Card template binds as `${$root.capacity_label}`. Without it the binding has nothing to resolve to.
 */
export const getSiteRecordsWithFormattedValues = (): IRawRecord[] => getSiteRecords().map((record) => ({
    ...record,
    'capacity@OData.Community.Display.V1.FormattedValue': `${record.capacity} pallets`
}))

/**
 * Generates many pins around a set of centres, for the story that shows the control handling a large view.
 *
 * Deterministic, so the same story always draws the same map and a screenshot stays comparable.
 *
 * @param count How many pins to generate.
 * @returns Raw records with coordinates, a category and a city.
 */
export const generateSiteRecords = (count: number): IRawRecord[] => {
    const centres = SAMPLE_SITES.slice(0, 8)
    const categories: ISampleSite['category'][] = ['depot', 'store', 'service']
    //a deterministic pseudo random sequence, so the map is identical on every run
    let seed = 20260902
    const next = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648
        return seed / 2147483648
    }
    return Array.from({ length: count }, (_, index) => {
        const centre = centres[index % centres.length]
        //tight clusters around each centre, so the grouping has something real to group
        const spread = 0.35 * Math.pow(next(), 2)
        const angle = next() * Math.PI * 2
        return {
            name: `${centre.city} site ${index + 1}`,
            category: categories[index % categories.length],
            city: centre.city,
            address: centre.address,
            capacity: Math.round(next() * 500),
            openedOn: `20${18 + (index % 8)}-0${1 + (index % 9)}-1${index % 10}`,
            lat: centre.lat + Math.sin(angle) * spread,
            lng: centre.lng + Math.cos(angle) * spread * 1.6
        }
    })
}
