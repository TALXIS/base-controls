import React, { useMemo, useState } from "react";
import { useViewSwitcher, useViewSwitcherComponents, useViewSwitcherLabels, ViewSwitcherNewQueryDialogContext } from "../../context"
import { SaveButton } from "./save-button";
import { MessageBar, MessageBarType, TextField } from "@fluentui/react";
import { getCreateNewViewDialogStyles } from "./styles";
import { useEventEmitter } from "../../../../hooks";
import { IViewSwitcherEvents } from "../../../../utils/view-switcher";

interface IDialogProps {
    onDismiss: () => void;
}

export const CreateNewQueryDialog = (props: IDialogProps) => {
    const viewSwitcher = useViewSwitcher();
    const components = useViewSwitcherComponents();
    const labels = useViewSwitcherLabels();
    const [newQueryName, setNewQueryName] = React.useState(viewSwitcher.getCurrentSavedQuery().displayName);
    const [newQueryDescription, setNewQueryDescription] = React.useState('');
    const styles = useMemo(() => getCreateNewViewDialogStyles(), []);
    const [errorMessage, setErrorMessage] = React.useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    useEventEmitter<IViewSwitcherEvents>(viewSwitcher, 'onError', (error, message) => onError(message));
    useEventEmitter<IViewSwitcherEvents>(viewSwitcher, 'onBeforeNewQueryCreated', () => onBeforeNewQueryCreated());
    useEventEmitter<IViewSwitcherEvents>(viewSwitcher, 'onNewQueryCreated', () => onNewQueryCreated());

    const onBeforeNewQueryCreated = () => {
        setErrorMessage(undefined);
        setIsLoading(true);
    }
    const onError = (message: string) => {
        setErrorMessage(message);
        setIsLoading(false);
    }
    const onNewQueryCreated = () => {
        setIsLoading(false);
    }

    const onCreateNewQuery = () => {
        viewSwitcher.createNewUserQuery({
            name: newQueryName,
            description: newQueryDescription
        });
    }

    return <ViewSwitcherNewQueryDialogContext.Provider value={{name: newQueryName}}>
        <components.CreateNewQueryDialog
            width="300px"
            labels={{
                headerText: labels.saveNewView
            }}
            loadingOptions={{
                isVisible: isLoading,
                message: labels.savingView
            }}
            components={{
                FooterPrimaryButton: SaveButton,
            }}
            onPrimaryButtonClick={onCreateNewQuery}
            onDismiss={props.onDismiss}>
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
                    defaultValue={newQueryName}
                    label={labels.name}
                    required
                    errorMessage={!newQueryName ? labels.nameRequired : undefined}
                    placeholder={labels.namePlaceholder}
                    onBlur={(e) => setNewQueryName(e.target.value)} />

                <TextField
                    label={labels.description}
                    placeholder={labels.descriptionPlaceholder}
                    multiline
                    onBlur={(e) => setNewQueryDescription(e.target.value)} />
            </div>
        </components.CreateNewQueryDialog>
    </ViewSwitcherNewQueryDialogContext.Provider>
}