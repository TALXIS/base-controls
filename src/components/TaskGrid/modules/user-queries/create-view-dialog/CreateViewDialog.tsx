import { DefaultButton, Dialog, DialogFooter, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { TextField } from "@components/TextField";
import { usePcfContext } from "@utils";
import * as React from "react";
import { withButtonLoading } from '@legacy';
import { useLocalizationService, useServices } from "@components/TaskGrid/context";
import { useEventEmitter } from "@hooks";
import { IUserQueryDataProvider, IUserQueryDataProviderEvents } from "../../interfaces";

/** Props for {@link CreateViewDialog}. */
interface ICreateViewDialog {
    onDismiss: () => void;
}

const SaveButton = withButtonLoading(PrimaryButton);

/** The *Save as new view* dialog: captures the grid's current columns, filters and sorting into a new view. */
export const CreateViewDialog = (props: ICreateViewDialog) => {
    const localizationService = useLocalizationService();
    const context = usePcfContext();
    const services = useServices();
    const savedQueryDataProvider = services.get('savedQueryDataProvider');
    const currentQuery = savedQueryDataProvider.getCurrentQuery();
    const userQueryProvider = services.get('userQueriesModule').provider;
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
            provider: services.get('taskDataProvider')
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