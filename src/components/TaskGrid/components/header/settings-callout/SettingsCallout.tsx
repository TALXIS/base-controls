import { Label, Toggle } from "@fluentui/react";
import * as React from "react"
import { getSettingsCalloutStyles } from "./styles";
import { useDatasetControl, useLocalizationService, useServices, useTaskDataProvider } from "@components/TaskGrid/context";

/**
 * The gear callout: the grid's own toggles, then the timeline's when the gantt module is registered.
 *
 * The module contributes its section rather than replacing this callout, which is why the header renders
 * it unconditionally.
 */
export const SettingsCallout = () => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const taskDataProvider = useTaskDataProvider();
    const styles = React.useMemo(() => getSettingsCalloutStyles(), []);
    const gantt = useServices().find('ganttModule');
    const inactiveTasksVisibility = datasetControl.getInactiveTasksVisibility();
    const isFlatListEnabled = taskDataProvider.isFlatListEnabled();
    const isHierarchyToggleVisible = datasetControl.isShowHierarchyToggleVisible();
    const isHideInactiveTasksToggleVisible = datasetControl.isHideInactiveTasksToggleVisible();


    return (<div className={styles.settingsCallout}>
        {isHierarchyToggleVisible && <>
            <Label>
                {localizationService.getLocalizedString('showHierarchy')}
            </Label>
            <Toggle
                checked={!isFlatListEnabled}
                onClick={() => {
                    datasetControl.toggleFlatList(!isFlatListEnabled);
                }} />
        </>}
        {isHideInactiveTasksToggleVisible && <>
            <Label>
                {localizationService.getLocalizedString('hideInactiveTasks')}
            </Label>
            <Toggle checked={!inactiveTasksVisibility} onClick={() => {
                datasetControl.toggleHideInactiveTasks(inactiveTasksVisibility);
            }} />
        </>}
        {gantt?.services.get('components').onRenderSettingsSection()}
    </div>);
}