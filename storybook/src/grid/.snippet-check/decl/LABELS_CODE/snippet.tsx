const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            labels: {
                menuSection: 'Řazení',
                sortTextAscending: 'Seřadit od A do Z',
                sortTextDescending: 'Seřadit od Z do A',
                sortNumberAscending: 'Od nejmenšího',
                sortNumberDescending: 'Od největšího',
                sortDateAscending: 'Od nejstaršího',
                sortDateDescending: 'Od nejnovějšího',
                clear: 'Zrušit řazení',
            },
        }),
    }}
    labels={{
        noRecordsFound: 'Nebyly nalezeny žádné záznamy.',
        valueLocked: 'Tuto hodnotu nelze upravit.',
    }}
    height='440px' />
