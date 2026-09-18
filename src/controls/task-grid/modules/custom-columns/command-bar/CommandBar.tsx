import { components } from "@controls/dataset-control/edit-columns/components";
import { ICommandBarItemProps, ICommandBarProps } from "@legacy";
import * as React from 'react';
import { useTaskGridEditColumns } from "../edit-columns/useTaskGridEditColumns";
import { useLocalizationService, useServices } from "@controls/task-grid/context";


/** The ribbon inside the custom-columns Edit Columns panel, adding the create-column command. */
export const CommandBar = (props: ICommandBarProps) => {
    const localizationService = useLocalizationService();
    const services = useServices();
    const { ...rest } = props;
    const { onCreateColumn } = useTaskGridEditColumns();

    const items = [
        ...props.items,
        ...(services.get('customColumnsModule').enableCustomColumnCreation ? [{
            key: 'add_custom_column',
            text: localizationService.getLocalizedString('addCustomColumn'),
            iconProps: { iconName: 'Add' },
            onClick: (e) => onCreateColumn()
        } as ICommandBarItemProps] : [])
    ] as ICommandBarItemProps[];

    return <components.CommandBar {...rest as any} items={items as any} />
}