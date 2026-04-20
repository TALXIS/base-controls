import { EditColumns as EditColumnsBase, IEditColumnsRef } from '../../../../DatasetControl/EditColumns/EditColumns';
import * as React from 'react';
import { getEditColumnsStyles } from './styles';
import { useIsLoading } from '../../../../../hooks';
import { TaskGridEditColumnsContext } from './useTaskGridEditColumns';
import { useDatasetControl, useLocalizationService, usePcfContext, useRootElementId } from '../../../context';
import { OptionCommandBar } from './OptionCommandBar/OptionCommandBar';
import { SortableItemCommandBar } from './SortableItemCommandBar/SortableItemCommandBar';
import { CommandBar } from './CommandBar/CommandBar';
import { ICustomColumnsDataProvider } from '../../../data-providers';


interface IEditColumnsProps {
    onDismiss: () => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const localizationService = useLocalizationService();
    const saveOnDismiss = React.useRef(false);
    const datasetControl = useDatasetControl();
    const customColumnsDataProvider: ICustomColumnsDataProvider | undefined = datasetControl.isCustomColumnsEnabled() ? datasetControl.getCustomColumnsDataProvider() : undefined;
    const editColumnsRef = React.useRef<IEditColumnsRef>();
    const pcfContext = usePcfContext();
    const rootElementId = useRootElementId();
    const styles = React.useMemo(() => getEditColumnsStyles(), []);
    
    const _onDeleteColumn = async (columnName: string) => {
        editColumnsRef.current?.remountColumnSelector();
        const response = await pcfContext.navigation.openConfirmDialog({
            text: localizationService.getLocalizedString('confirmColumnDelete'),
        })
        if (response.confirmed) {
            const result = await customColumnsDataProvider?.deleteColumn(columnName);
            if (result) {
                saveOnDismiss.current = true;
                editColumnsRef.current?.remountColumnSelector();
            }
        }
    }

    const _onCreateColumn = async () => {
        editColumnsRef.current?.remountColumnSelector();
        const result = await customColumnsDataProvider?.createColumn();
        if (result) {
            editColumnsRef.current?.remountColumnSelector();
            const column = customColumnsDataProvider?.getColumns().find((col: import('@talxis/client-libraries').IColumn) => col.name === result)!
            editColumnsRef.current?.editColumnsModel.addColumn(column);
        }
    }

    const _onEditColumn = async (columnName: string, requireRemount?: boolean) => {
        if (!requireRemount) {
            editColumnsRef.current?.remountColumnSelector();
            const result = await customColumnsDataProvider?.updateColumn(columnName);
            if (result) {
                editColumnsRef.current?.remountColumnSelector();
            }
        }
        else {
            const response = await pcfContext.navigation.openConfirmDialog({
                text: localizationService.getLocalizedString('confirmColumnEdit'),
            });
            if (response.confirmed) {
                const result = await customColumnsDataProvider?.updateColumn(columnName);
                if (result) {
                    const column = customColumnsDataProvider?.getColumns().find((col: import('@talxis/client-libraries').IColumn) => col.name === columnName)!;
                    //re-add the column to make sure the metadata are updated
                    editColumnsRef.current?.editColumnsModel.deleteColumn(columnName);
                    editColumnsRef.current?.editColumnsModel.addColumn(column);
                    editColumnsRef.current?.editColumnsModel.save();
                }
            }
        }
    }

    const onDismiss = () => {
        if (saveOnDismiss.current) {
            editColumnsRef.current?.editColumnsModel.save();
        }
        else {
            props.onDismiss();
        }
    }

    const [isDeleteInProgress, onDeleteColumn] = useIsLoading(_onDeleteColumn);
    const [isCreateInProgress, onCreateColumn] = useIsLoading(() => _onCreateColumn());
    const [isUpdateInProgress, onEditColumn] = useIsLoading((columnName: string, requireRemount?: boolean) => _onEditColumn(columnName, requireRemount));

    const isLoading = isDeleteInProgress || isCreateInProgress || isUpdateInProgress;

    return <TaskGridEditColumnsContext.Provider value={{ onCreateColumn, onEditColumn, onDeleteColumn }}>
        <EditColumnsBase
            isLoading={isLoading}
            showScopeSelector={datasetControl.isEditColumnsScopeSelectorEnabled()}
            panelProps={{
                isBlocking: true,
                onOuterClick: () => { },
                focusTrapZoneProps: {
                    forceFocusInsideTrap: false
                },
                layerProps: {
                    hostId: rootElementId,
                    styles: {
                        root: styles.layerHost
                    }
                }
            }}
            onGetRef={(ref) => editColumnsRef.current = ref}
            components={datasetControl.isCustomColumnsEnabled() ? {
                CommandBar: CommandBar as () => JSX.Element,
                SortableItemCommandBar: SortableItemCommandBar,
                OptionCommandBar: OptionCommandBar
            } : undefined}
            onDismiss={onDismiss} />
    </TaskGridEditColumnsContext.Provider>
}