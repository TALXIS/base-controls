import { CommandBar, CommandBarButton, MessageBar, MessageBarType, Spinner, SpinnerSize } from "@fluentui/react";
import { useGridInstance } from "../../hooks/useGridInstance";
import { useSave } from "./hooks/useSave";
import React, { useState } from 'react';
import { getSaveStyles } from "./styles";
import { ChangeEditor } from "./components/ChangeEditor/ChangeEditor";
import { useRecordUpdateServiceController } from "../../services/RecordUpdateService/controllers/useRecordUpdateServiceController";

export const Save = () => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const styles = getSaveStyles();
    const { isDirty, updatedRecords, clearAll } = useRecordUpdateServiceController();
    const { isSaving, saveBtnProps, save } = useSave();
    const [changeEditorOpened, setChangeEditorOpened] = useState<boolean>(false);

    const onMessageClick = () => {
        if (!isDirty) {
            //return;
        }
        setChangeEditorOpened(true);
    }

    return (
        <>
            <div onClick={onMessageClick} className={styles.root} data-dirty={isDirty && !grid.props.parameters.ChangeEditorMode!}>
                <MessageBar
                    messageBarType={true ? MessageBarType.info : MessageBarType.error}
                    actions={
                        <div className={styles.actions}>
                            <CommandBarButton
                                text={isSaving ? saveBtnProps.text : undefined}
                                disabled={saveBtnProps.disabled}
                                onRenderIcon={isSaving ? () => <Spinner size={SpinnerSize.small} /> : undefined}
                                iconProps={{
                                    iconName: saveBtnProps.iconName,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    save();
                                }}
                            />
                            <CommandBarButton
                                disabled={saveBtnProps.disabled}
                                iconProps={{
                                    iconName: 'Delete'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAll();
                                }}
                            />
                        </div>
                    } isMultiline={false}>
                    {isDirty && !grid.props.parameters.ChangeEditorMode &&
                        <span className={styles.notificationText} dangerouslySetInnerHTML={{
                            __html: labels["saving-changenotification"]({ numOfChanges: updatedRecords.length })
                        }}></span>
                    }
                </MessageBar>
            </div>
            {changeEditorOpened &&
                <ChangeEditor onDismiss={(e) => {
                    //@ts-ignore
                    if(e.code === 'Escape') {
                        return;
                    }
                    setChangeEditorOpened(false);
                }} />
            }
        </>
    )
};