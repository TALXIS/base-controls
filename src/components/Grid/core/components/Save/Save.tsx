import { CommandBarButton, MessageBar, MessageBarType } from "@fluentui/react";
import { useGridInstance } from "../../hooks/useGridInstance";
import { useSave } from "./hooks/useSave";
import { useState } from 'react';
import { getSaveStyles } from "./styles";
import { ChangeEditor } from "./components/ChangeEditor/ChangeEditor";
import { withButtonLoading } from "@talxis/react-components";

const CommandBarButtonWithLoading = withButtonLoading(CommandBarButton);

export const Save = () => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const styles = getSaveStyles();
    const { isSaving, save } = useSave();
    const [changeEditorOpened, setChangeEditorOpened] = useState<boolean>(false);
    const hasInvalidRecords = !grid.changeTracker.isValid();
    const isDirty = grid.changeTracker.isDirty();
    const numOfChanges = grid.changeTracker.getChanges().size;

    const onMessageClick = () => {
        if (!isDirty || isSaving) {
            return;
        }
        setChangeEditorOpened(true);
    }
    return (
        <>
            <div onClick={onMessageClick} className={styles.root} data-dirty={isDirty}>
                <MessageBar
                    messageBarType={!hasInvalidRecords ? MessageBarType.info : MessageBarType.error}
                    actions={
                        <div className={styles.actions}>
                            <CommandBarButtonWithLoading
                                isLoading={isSaving}
                                disabled={hasInvalidRecords}
                                text={isSaving ? grid.labels["saving-saving"]() : undefined}
                                iconProps={{
                                    iconName: 'Save',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    save();
                                }}
                            />
                            <CommandBarButton
                                text={grid.labels['saving-discard-all']()}
                                disabled={isSaving}
                                iconProps={{
                                    iconName: 'EraseTool'
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const response = await grid.pcfContext.navigation.openConfirmDialog({
                                        text: grid.labels['saving-discard-all-confirmation']()
                                    });
                                    if (response.confirmed) {
                                        grid.changeTracker.clearChanges();
                                        grid.pcfContext.factory.requestRender();
                                    }
                                }}
                            />
                        </div>
                    } isMultiline={false}>
                    {isDirty &&
                        <span className={styles.notificationText} dangerouslySetInnerHTML={{
                            __html: labels["saving-changenotification"]({ numOfChanges: numOfChanges })
                        }}></span>
                    }
                </MessageBar>
            </div>
            {changeEditorOpened &&
                <ChangeEditor onDismiss={(e) => {
                    //@ts-ignore
                    if (e?.code === 'Escape') {
                        return;
                    }
                    setChangeEditorOpened(false);
                }} />
            }
        </>
    )
};