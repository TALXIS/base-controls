import { ContextualMenuItemType, Icon, IconButton, IContextualMenuItem } from "@fluentui/react"
import { ICellProps } from "../../../../../Grid/cells/cell/Cell"
import * as React from "react"
import { getAddTaskButtonStyles } from "./styles";
import { IRecord } from "@talxis/client-libraries";
import { RecordSelector } from "../../record-selector/RecordSelector";
import { useDatasetControl, useLocalizationService, useTaskDataProvider, useTaskGridDescriptor } from "../../../../context";

export const AddTaskButton = (props: ICellProps) => {
    const styles = React.useMemo(() => getAddTaskButtonStyles(), []);
    const record: IRecord = props.data;
    const taskDataProvider = useTaskDataProvider();
    const datasetControl = useDatasetControl();
    const localizationService = useLocalizationService();
    const [isButtonMounted, setIsButtonMounted] = React.useState(true);
    const isTaskAddingEnabled = taskDataProvider.isTaskAddingEnabled();

    const addTaskFromTemplate = async (templateId: string) => {
        //this needs to be done so the button menu does not overlay the dialog
        setIsButtonMounted(false);
        await taskDataProvider.createTasksFromTemplate(templateId, record.getRecordId());
        setIsButtonMounted(true);
    }

    const isButtonVisible = (): boolean => {
        if (taskDataProvider.isFlatListEnabled() || !isTaskAddingEnabled) {
            return false;
        }
        return isButtonMounted;
    }

    const getMenuItems = (): IContextualMenuItem[] => {
        const isTemplatingEnabled = datasetControl.isTemplatingEnabled();
        return [{
            key: 'addChild',
            text: localizationService.getLocalizedString('addChild'),
            iconProps: {
                iconName: 'Add'
            },
            onClick: () => {taskDataProvider.createTask(record.getRecordId())}
        },
        {
            key: 'divider',
            itemType: ContextualMenuItemType.Divider
        },
        ...(!isTemplatingEnabled ? [] : [{
            key: 'taskFromTemplate',
            text: localizationService.getLocalizedString('taskFromTemplate'),
            iconProps: {
                iconName: 'PageList'
            },
            subMenuProps: {
                items: [{
                    key: 'dummy'
                }],
                onRenderMenuList: () => <RecordSelector
                    provider={datasetControl.getTemplateDataProvider()}
                    onRenderRecord={(props, defautRender) => {
                        return defautRender({
                            ...props,
                            iconProps: {
                                iconName: 'AddToShoppingList'
                            }
                        })
                    }}
                    onRecordSelected={addTaskFromTemplate} />
            }
        }])];
    }

    if (!record.isActive()) {
        return <div className={styles.uneditableIconContainer} title={localizationService.getLocalizedString('canNotEditCompletedTask')}>
            <Icon
                className={styles.uneditableIcon}
                iconName='Uneditable'
            />
        </div>
    }
    else if (isButtonVisible()) {
        return <IconButton
            className={`${styles.addTaskBtnRoot} talxis_task-grid_add-task-button`}
            iconProps={{
                iconName: 'Add'
            }}
            menuProps={{
                items: getMenuItems()
            }}
            styles={{
                menuIcon: styles.addTaskMenuIcon
            }} />
    }
    else {
        return <></>
    }

}