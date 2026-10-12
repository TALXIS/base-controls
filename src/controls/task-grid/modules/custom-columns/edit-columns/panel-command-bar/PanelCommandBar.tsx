import { ICommandBarProps } from "@legacy";
import { EditColumnsPanelUiComponents } from "@controls/dataset-control";
import { useTaskGridLabels } from "@controls/task-grid/context";
import { useCustomColumnCommands } from "../useCustomColumnCommands";

/** The column editor's command bar, with *New column* when creating custom columns is on. */
export const PanelCommandBar = (props: ICommandBarProps) => {
    const labels = useTaskGridLabels();
    const { customColumns, createColumn } = useCustomColumnCommands();
    return EditColumnsPanelUiComponents.onRenderCommandBar({
        ...props,
        items: [
            ...props.items,
            ...(customColumns.enableCustomColumnCreation ? [{
                key: 'addCustomColumn',
                text: labels.getLocalizedString('addCustomColumn'),
                iconProps: { iconName: 'Add' },
                onClick: () => { createColumn(); },
            }] : []),
        ],
    });
};
