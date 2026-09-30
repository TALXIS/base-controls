const ValueHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={{
    label: {
        onRenderText: textProps => <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Icon iconName='Money' style={{ color: '#107c10' }} />
            {textProps.children}
        </span>,
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
    colDefs={{ value: { headerComponent: ValueHeader } }}
    height='440px' />
