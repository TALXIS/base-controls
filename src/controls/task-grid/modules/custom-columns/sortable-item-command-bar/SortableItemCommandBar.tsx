import { ICommandBarItemProps } from '@legacy';
import * as React from 'react';
import { components, ISortableItemCommandBarProps } from '@components/DatasetControl/EditColumns/components';
import { useTaskGridEditColumns } from '../edit-columns/useTaskGridEditColumns';
import { useServices } from '@components/TaskGrid/context';


/** Per-column commands on a selected column in the Edit Columns panel. */
export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const customColumns = useServices().get('customColumnsModule');
    const customColumnsDataProvider = customColumns.provider;
    const { column, ...rest } = props;
    const { onEditColumn } = useTaskGridEditColumns();
    const isCustomColumn = React.useMemo(() => customColumnsDataProvider.getColumns().find((col: import('@talxis/client-libraries').IColumn) => col.name === column.name), []);

    const farItems = [
        ...(isCustomColumn && customColumns.enableCustomColumnEditing ? [{
            key: 'edit',
            onMouseUp: () => {
                onEditColumn(column.name, true);
            },
            iconProps: { iconName: 'Edit' },
        } as ICommandBarItemProps] : []),
        ...(props.farItems ?? []),
    ]
    return <components.SortableItemCommandBar {...rest as any} farItems={farItems as any} />
}