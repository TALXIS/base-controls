import { useEventEmitter, useRerender } from "@core";
import { useDatasetControlModule } from "@controls/dataset-control";
import { Grid, IColumnHeaderRendererProps } from "@controls/grid";
import type { ILookupManyEvents } from "../../LookupMany";
import { LookupManyFilterCallout } from "../lookup-many-filter-callout";

/** A lookup-many column's header with the module's filter callout. */
export const LookupManyColumnHeader = (props: IColumnHeaderRendererProps) => {
    const { rerender } = useRerender();
    const lookupMany = useDatasetControlModule('lookupMany');
    const components = props.components ?? {};

    useEventEmitter<ILookupManyEvents>(lookupMany.events, 'onFilterChanged', rerender);

    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme theme={props.theme}>
            <Grid.ColumnHeader.Container components={components.container}>
                <Grid.ColumnHeader.Prefix components={components.prefix} />
                <Grid.ColumnHeader.Content components={components.content}>
                    <Grid.ColumnHeader.Label components={components.label} />
                    <Grid.ColumnHeader.RequiredMarker components={components.requiredMarker} />
                </Grid.ColumnHeader.Content>
                <Grid.ColumnHeader.Suffix components={components.suffix} />
            </Grid.ColumnHeader.Container>
            <Grid.ColumnHeader.Menu components={components.menu} />
            {lookupMany.getOpenFilter() === props.column.getColId() && <LookupManyFilterCallout />}
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
