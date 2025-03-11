import { CommandBarButton, MessageBar, MessageBarType } from "@fluentui/react";
import { useGridInstance } from "../../hooks/useGridInstance";
import { useState } from 'react';
import { getSaveStyles } from "./styles";
import { ChangeEditor } from "./components/ChangeEditor/ChangeEditor";


export const Save = () => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const styles = getSaveStyles(grid.parameters.EnableChangeEditor?.raw !== false);
    const [isSaving, setIsSaving] = useState(false);
    const [changeEditorOpened, setChangeEditorOpened] = useState<boolean>(false);
    const isDatasetValid = grid.dataset.isValid();
    const isDirty = grid.dataset.isDirty?.();
    const numOfChanges = Object.keys(grid.dataset.getChanges?.() ?? []).length;

    const onMessageClick = () => {
        if (!isDirty || isSaving || grid.parameters.EnableChangeEditor?.raw === false) {
            return;
        }
        setChangeEditorOpened(true);
    }
    return (
        <>
            <div onClick={onMessageClick} className={`${styles.root} talxis__grid-control__notification-bar`}>
                <MessageBar
                    messageBarType={isDatasetValid ? MessageBarType.info : MessageBarType.error}
                    actions={
                        <div className={styles.actions}>
                            <CommandBarButton
                                disabled={!isDatasetValid || grid.dataset.loading}
                                text={isSaving ? grid.labels["saving-saving"]() : undefined}
                                iconProps={{
                                    iconName: 'Save',
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    setIsSaving(true);
                                    await grid.dataset.paging.loadExactPage(grid.paging.pageNumber, true);
                                    setIsSaving(false);
                                }}
                            />
                            <CommandBarButton
                                text={grid.labels['saving-discard-changes']()}
                                disabled={isSaving || grid.dataset.loading}
                                iconProps={{
                                    iconName: 'EraseTool'
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm(grid.labels['saving-discard-all-confirmation']())) {
                                        grid.dataset.clearChanges?.();
                                        grid.pcfContext.factory.requestRender();
                                    }
                                }}
                            />
                        </div>
                    } isMultiline={false}>
                    <span className={styles.notificationText} dangerouslySetInnerHTML={{
                        __html: (() => {
                            let message = labels["saving-changenotification"]({ numOfChanges: numOfChanges })
                            if (grid.parameters.EnableChangeEditor?.raw !== false) {
                                message += ` ${grid.labels['saving-clickreview']()}`
                            }
                            return message;
                        })()
                    }}></span>
                </MessageBar>
            </div>
            {changeEditorOpened &&
                <ChangeEditor onDismiss={(e, shouldRefresh) => {
                    setChangeEditorOpened(false);
                    if(shouldRefresh) {
                        grid.dataset.paging.loadExactPage(grid.dataset.paging.pageNumber);
                    }
                    else {
                        grid.pcfContext.factory.requestRender();
                    }
                }} />
            }
        </>
    )
};