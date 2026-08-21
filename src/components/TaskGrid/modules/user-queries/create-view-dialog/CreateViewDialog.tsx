import { DefaultButton, Dialog, DialogFooter, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { TextField } from "@components/TextField";
import * as React from "react";
import { withButtonLoading } from '@legacy';
import { useDatasetControl, useLocalizationService, usePcfContext } from "@components/TaskGrid/context";
import { useEventEmitter } from "@hooks";
import { IUserQueryDataProvider, IUserQueryDataProviderEvents } from "../../interfaces";

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
    //this dialog is only ever rendered by the module that owns this provider, so require it rather than
    //narrowing an optional the caller cannot actually be without
    const userQueryProvider = datasetControl.getModule('userQueries').provider;
    const [name, setName] = React.useState<string>(currentQuery.name);
    const [description, setDescription] = React.useState<string>("");
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    useEventEmitter<IUserQueryDataProviderEvents>(userQueryProvider.events, 'onBeforeUserQueryCreated', () => {
        setIsSaving(true);
        setErrorMessage(null);
    })
    useEventEmitter<IUserQueryDataProviderEvents>(userQueryProvider.events, 'onError', (error, errorMessage) => {
        setIsSaving(false);
        setErrorMessage(errorMessage ?? '');
    });

    const onSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        userQueryProvider.create({
            name: name,
            description: description,
            currentQuery: currentQuery,
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