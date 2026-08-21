import * as React from "react";
import {  ICommandBarItemProps } from "@legacy";
import { getCustomColumnSuffixStyles } from "./styles";
import { useTaskGridEditColumns } from "../edit-columns/useTaskGridEditColumns";
import { IOptionCommandBarProps, components } from "@components/DatasetControl/EditColumns/components";
import { useDatasetControl } from "@components/TaskGrid/context";


export const OptionCommandBar = (props: IOptionCommandBarProps) => {
    const { column, context } = props;
    const { onEditColumn, onDeleteColumn } = useTaskGridEditColumns();
    const datasetControl = useDatasetControl();
    const customColumns = datasetControl.getModule('customColumns');
    const columnsDataProvider = customColumns.provider;
    const styles = React.useMemo(() => getCustomColumnSuffixStyles(), []);
    const isCustomColumn = React.useMemo(() => columnsDataProvider.getColumns().find((col: import('@talxis/client-libraries').IColumn) => col.name === column.name), []);

    const getCommandBarItems = (): ICommandBarItemProps[] => {
        switch (true) {
            case context === 'scopeSelector':
            case !isCustomColumn: {
                return [];
            }
        }
        return [
            ...customColumns.enableCustomColumnEditing ? [{
                key: 'edit',
                className: styles.button,
                iconProps: { iconName: 'Edit' },
                onClick: (e: any) => {
                    e.stopPropagation();
                    e.preventDefault();
                    queueMicrotask(() => onEditColumn(column.name));
                }
            }] : [],
            ...customColumns.enableCustomColumnDeletion ? [{
                key: 'delete',
                className: styles.button,
                iconProps: { iconName: 'Delete' },
                onClick: (e: any) => {
                    e.stopPropagation();
                    e.preventDefault();
                    queueMicrotask(() => onDeleteColumn(column.name));
                }
            } as ICommandBarItemProps] : []
        ] as ICommandBarItemProps[];
    }

    return <components.OptionCommandBar {...props} items={getCommandBarItems() as any} styles={{
        root: styles.commandBar
    }} />
}