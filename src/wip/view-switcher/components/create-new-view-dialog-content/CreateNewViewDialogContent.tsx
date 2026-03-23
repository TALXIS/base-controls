import { useEffect, useMemo, useState } from "react"
import { getCreateNewViewDialogStyles } from "./styles";
import { MessageBar, MessageBarType, TextField } from "@fluentui/react";
import { useViewSwitcher, useViewSwitcherLabels } from "../../context";
import React from "react";
import { useEventEmitter, useIsLoading } from "../../../../hooks";
import { IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useLoadingOverlayProvider } from "../../../loading-overlay-provider";
import { IViewSwitcherEvents } from "../../../../utils/view-switcher";

interface ICreateNewViewDialogContentProps {
    name: string;
    description?: string
    onChangeName: (name: string) => void;
    onChangeDescription: (description: string) => void;
}


export const CreateNewViewDialogContent = () => {

    const labels = useViewSwitcherLabels();
    const styles = useMemo(() => getCreateNewViewDialogStyles(), []);
    const viewSwitcher = useViewSwitcher();
    const [name, setName] = React.useState(viewSwitcher.getCurrentSavedQuery().displayName);
    const [description, setDescription] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState<string>();
    const [isLoading, executeWithLoading] = useIsLoading();
    const loadingOverlayProvider = useLoadingOverlayProvider();

    useEventEmitter<IViewSwitcherEvents>(viewSwitcher, 'onError', (error, message) => onError(message));
    useEventEmitter<IViewSwitcherEvents>(viewSwitcher, 'onBeforeNewQueryCreated', () => onBeforeNewQueryCreated());

    const onBeforeNewQueryCreated = () => {
        setErrorMessage(undefined);
    }
    const onError = (message: string) => {
        setErrorMessage(message);
    }
    const onSave = async () => {
        executeWithLoading(() => viewSwitcher.createNewUserQuery({ name, description }));
    }

    useEffect(() => {
        loadingOverlayProvider.toggle({ isVisible: isLoading, message: labels.savingView });
    }, [isLoading]);

    return (
        <div className={styles.contentWrapper}>
            {errorMessage &&
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                    truncated
                >
                    {errorMessage}
                </MessageBar>
            }
            <TextField
                value={name}
                label={labels.name}
                required
                errorMessage={!name ? labels.nameRequired : undefined}
                placeholder={labels.namePlaceholder}
                onChange={(e, newValue) => setName(newValue || '')} />

            <TextField
                value={description}
                label={labels.description}
                placeholder={labels.descriptionPlaceholder}
                multiline
                onChange={(e, newValue) => setDescription(newValue || '')} />
            <button onClick={() => onSave()}>test</button>
        </div>
    )
}