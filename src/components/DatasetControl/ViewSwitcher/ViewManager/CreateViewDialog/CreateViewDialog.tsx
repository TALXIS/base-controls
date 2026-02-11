import { Dialog, DialogFooter, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { useModel } from "../../../useModel";
import { TextField, withButtonLoading } from "@talxis/react-components";
import React, { useMemo } from "react";
import { useIsLoading } from "../../../../../hooks";
import { getCreateViewDialogStyles } from "./styles";

const SaveButton = withButtonLoading(PrimaryButton);

interface ICreateViewDialogProps {
    onDismiss: () => void;
}

export const CreateViewDialog = (props: ICreateViewDialogProps) => {
    const model = useModel();
    const labels = model.getLabels();
    const viewSwitcher = model.getDatasetControl().viewSwitcher;
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState<string>();
    const styles = useMemo(() => getCreateViewDialogStyles(), []);

    const [isLoading, saveNewView] = useIsLoading(async () => {
        const result = await viewSwitcher.saveNewUserQuery({ name, description });
        if (!result.success) {
            setErrorMessage(result.errors?.map(e => e.message).join(', ') ?? 'Unknown error');
        }
    });

    const onDismiss = () => {
        if (!isLoading) {
            props.onDismiss();
        }
    }

    return <Dialog
        hidden={false}
        onDismiss={onDismiss}
        dialogContentProps={{
            title: labels['save-new-view'](),
        }}
        modalProps={{
            isBlocking: true
        }}
    >
        <div className={styles.contentWrapper}>
            {errorMessage && <MessageBar
                isMultiline={false}
                truncated
                messageBarType={MessageBarType.error}>
                {errorMessage}
            </MessageBar>}
            <TextField
                value={name}
                label={labels['name']()}
                disabled={isLoading}
                required
                onChange={(e, newValue) => setName(newValue ?? '')} />
            <TextField
                value={description}
                label={labels['description']()}
                disabled={isLoading}
                multiline
                onChange={(e, newValue) => setDescription(newValue ?? '')} />
        </div>
        <DialogFooter>
            <SaveButton
                text={labels['save']()}
                isLoading={isLoading}
                onClick={saveNewView}
                disabled={!name.trim()}
            />
        </DialogFooter>

    </Dialog>
}