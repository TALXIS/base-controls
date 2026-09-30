const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            components: {
                sortIcon: {
                    onRenderIcon: ({ descending, ...iconProps }) => <Icon {...iconProps} iconName={descending ? 'ChevronDownMed' : 'ChevronUpMed'} style={{ color: '#5B5FC7' }} />,
                },
            },
        }),
        filtering: createFilteringModule({
            components: {
                filterIcon: {
                    onRenderIcon: iconProps => <Icon {...iconProps} style={{ color: '#5B5FC7' }} />,
                },
            },
        }),
    }}
    height='440px' />
