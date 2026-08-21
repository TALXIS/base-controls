import { ICommandBarItemProps } from '@legacy';
import * as React from 'react';
import { components, ISortableItemCommandBarProps } from '@components/DatasetControl/EditColumns/components';
import { useTaskGridEditColumns } from '@components/TaskGrid/components/header/edit-columns/useTaskGridEditColumns';
import { useDatasetControl } from '@components/TaskGrid/context';


export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const datasetControl = useDatasetControl();
    const customColumns = datasetControl.getModule('customColumns');
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