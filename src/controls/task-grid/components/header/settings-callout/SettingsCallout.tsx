import { Label, Toggle } from "@fluentui/react";
import * as React from "react"
import { getSettingsCalloutStyles } from "./styles";
import { useTaskGridRuntime, useTaskGridLabels, useTaskDataProvider } from "@controls/task-grid/context";

/**
 * The gear callout: the grid's own toggles, then the timeline's when the gantt module is registered.
 *
 * The module contributes its section rather than replacing this callout, which is why the header renders
 * it unconditionally.
 */
export const SettingsCallout = () => {
    const localizationService = useTaskGridLabels();
    const runtime = useTaskGridRuntime();
    const taskDataProvider = useTaskDataProvider();
    const styles = React.useMemo(() => getSettingsCalloutStyles(), []);
    const gantt = runtime.services.find('ganttModule');
    const inactiveTasksVisibility = runtime.getInactiveTasksVisibility();
    const isFlatListEnabled = taskDataProvider.isFlatListEnabled();
    const isHierarchyToggleVisible = runtime.isShowHierarchyToggleVisible();
    const isHideInactiveTasksToggleVisible = runtime.isHideInactiveTasksToggleVisible();


    return (<div className={styles.settingsCallout}>
        {isHierarchyToggleVisible && <>
            <Label>
                {localizationService.getLocalizedString('showHierarchy')}
            </Label>
            <Toggle
                checked={!isFlatListEnabled}
                onClick={() => {
                    runtime.toggleFlatList(!isFlatListEnabled);
                }} />
        </>}
        {isHideInactiveTasksToggleVisible && <>
            <Label>
                {localizationService.getLocalizedString('hideInactiveTasks')}
            </Label>
            <Toggle checked={!inactiveTasksVisibility} onClick={() => {
                runtime.toggleHideInactiveTasks(inactiveTasksVisibility);
            }} />
        </>}
        {gantt?.services.get('components').onRenderSettingsSection()}
    </div>);
}