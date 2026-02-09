import { Dialog, DialogFooter, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { useModel } from "../../../useModel";
import { TextField, withButtonLoading } from "@talxis/react-components";
import React from "react";
import { useIsLoading } from "../../../../../hooks";

const SaveButton = withButtonLoading(PrimaryButton);

interface ICreateViewDialogProps {
    onDismiss: () => void;
}

export const CreateViewDialog = (props: ICreateViewDialogProps) => {
    const { onDismiss } = props;
    const model = useModel();
    const labels = model.getLabels();
    const viewSwitcher = model.getDatasetControl().viewSwitcher;
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState<string>();

    const [isLoading, saveNewView] = useIsLoading(async () => {
        const result = await viewSwitcher.saveNewUserQuery({ name, description });
        if (!result.success) {
            setErrorMessage(result.errors?.map(e => e.message).join(', ') ?? 'Unknown error');
        }
    });

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
        {errorMessage && <MessageBar messageBarType={MessageBarType.error}>
            {errorMessage}
        </MessageBar>}
        <div>
            <TextField
                value={name}
                onChange={(e, newValue) => setName(newValue || '')} />
            <TextField
                value={description}
                onChange={(e, newValue) => setDescription(newValue || '')} />
        </div>
        <DialogFooter>
            <SaveButton
                text={labels['save']()}
                isLoading={isLoading}
                onClick={saveNewView}
            />
        </DialogFooter>

    </Dialog>
}