import { ICommandBarItemProps } from '@talxis/react-components';
import * as React from 'react';
import { components, ISortableItemCommandBarProps } from '../../../../../DatasetControl/EditColumns/components';
import { useTaskGridEditColumns } from '../useTaskGridEditColumns';
import { useDatasetControl } from '../../../../context';


export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const datasetControl = useDatasetControl();
    const customColumnsDataProvider = datasetControl.getCustomColumnsDataProvider();
    const { column, ...rest } = props;
    const { onEditColumn } = useTaskGridEditColumns();
    const isCustomColumn = React.useMemo(() => customColumnsDataProvider.getColumns().find(col => col.name === column.name), []);

    const farItems = [
        ...(isCustomColumn && customColumnsDataProvider.isEditEnabled() ? [{
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