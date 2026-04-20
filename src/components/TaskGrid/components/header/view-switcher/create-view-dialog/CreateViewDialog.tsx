import { DefaultButton, Dialog, DialogFooter, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { TextField } from "../../../../../TextField";
import * as React from "react";
import { withButtonLoading } from '@talxis/react-components';
import { useDatasetControl, useLocalizationService, usePcfContext } from "../../../../context";
import { useEventEmitter } from "../../../../../../hooks";
import { ISavedQueryDataProvider, ISavedQueryDataProviderEvents } from "../../../../data-providers";

interface ICreateViewDialog {
    onDismiss: () => void;
}

const SaveButton = withButtonLoading(PrimaryButton);

export const CreateViewDialog = (props: ICreateViewDialog) => {
    const localizationService = useLocalizationService();
    const context = usePcfContext();
    const datasetControl = useDatasetControl();
    const savedQueryDataProvider = datasetControl.getSavedQueryDataProvider();
    const currentQuery = savedQueryDataProvider.getCurrentQuery();
    const [name, setName] = React.useState<string>(currentQuery.name);
    const [description, setDescription] = React.useState<string>("");
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    useEventEmitter<ISavedQueryDataProviderEvents>(savedQueryDataProvider.queryEvents, 'onBeforeUserQueryCreated', () => {
        setIsSaving(true);
        setErrorMessage(null);
    })
    useEventEmitter<ISavedQueryDataProviderEvents>(savedQueryDataProvider.queryEvents, 'onError', (error, errorMessage) => {
        setIsSaving(false);
        setErrorMessage(errorMessage ?? '');
    });

    const onSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        savedQueryDataProvider.createUserQuery({
            name: name,
            description: description,
            provider: datasetControl.getDataProvider()
        });
    }

    return <Dialog
        {...props}
        hidden={false}
        dialogContentProps={{
            title: localizationService.getLocalizedString('saveAsNew'),
        }}
        modalProps={{
            isBlocking: true
        }}
        onDismiss={props.onDismiss}
    >
        {errorMessage && <MessageBar messageBarType={MessageBarType.error}>
            {errorMessage}
        </MessageBar>}
        <TextField
            context={context}
            parameters={{
                value: {
                    raw: null
                }
            }} onOverrideComponentProps={(props) => {
                return {
                    ...props,
                    label: localizationService.getLocalizedString('name'),
                    value: name,
                    onChange: (e, newValue) => setName(newValue ?? '')
                }
            }} />
        <TextField
            context={context}
            parameters={{
                value: {
                    raw: null,
                    type: 'Multiple'
                }
            }} onOverrideComponentProps={(props) => {
                return {
                    ...props,
                    label: localizationService.getLocalizedString('description'),
                    value: description,
                    onChange: (e, newValue) => setDescription(newValue ?? '')
                }
            }} />
        <DialogFooter>
            <SaveButton
                isLoading={isSaving}
                disabled={name.length === 0}
                text={localizationService.getLocalizedString('save')}
                onClick={onSave} />
            <DefaultButton
                text={localizationService.getLocalizedString('cancel')}
                onClick={props.onDismiss} />
        </DialogFooter>
    </Dialog>
}