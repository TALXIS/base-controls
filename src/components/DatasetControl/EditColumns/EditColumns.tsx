import { CommandBar, DefaultButton, Panel, PrimaryButton, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem/SortableItem";
import { EditColumnsModel, IEditColumnsEvents } from "./EditColumnsModel";
import { useEventEmitter } from "../../../hooks";
import { useRerender } from "@talxis/react-components";
import { ColumnSelector } from "./ColumnSelector/ColumnSelector";

interface IEditColumnsProps {
    onDismiss: () => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const { onDismiss } = props;
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const dataset = datasetControl.getDataset();
    const provider = dataset.getDataProvider();
    const theme = useTheme();
    const styles = useMemo(() => getEditColumnsStyles(theme), []);
    const editColumnsModel = useMemo(() => new EditColumnsModel({ datasetControl }), []);
    const columns = editColumnsModel.getColumns();
    const sensor = useSensor(PointerSensor);
    const rerender = useRerender();
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnsChanged', rerender);

    const getTitle = () => {
        const collectionName = provider.getMetadata().DisplayCollectionName;
        let title = 'Edit Columns';
        if(collectionName) {
            title += `: ${collectionName}`;
        }
        return title;
    }

    return <Panel
        headerText={getTitle()}
        isOpen={true}
        onDismiss={onDismiss}
        styles={{
            footer: styles.panelFooter,
            commands: styles.panelCommands,
            scrollableContent: styles.panelScrollableContent,
            content: styles.panelContent
        }}
        isFooterAtBottom
        onRenderFooterContent={() => {
            return <div className={styles.panelFooterButtons}>
                <PrimaryButton
                    onClick={() => {
                        editColumnsModel.save();
                        onDismiss();
                    }}
                    text="Save" />
                <DefaultButton
                    text="Cancel"
                    onClick={onDismiss}
                />
            </div>
        }}
    >
        <div className={styles.header}>
            <CommandBar items={[{
                key: 'button1',
                text: 'Custom Button',
                iconProps: {
                    iconName: 'Add'
                }
            }, {
                key: 'button2',
                text: 'Custom Button 2',
                iconProps: {
                    iconName: 'Heart'
                }
            }]} />
            <ColumnSelector editColumnsModel={editColumnsModel} />
        </div>
        <div className={styles.scrollableContainer}>
            <DndContext
                sensors={[sensor]}
                onDragEnd={(e) => editColumnsModel.onColumnMoved(e)}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    strategy={verticalListSortingStrategy}
                    items={editColumnsModel.getColumns()}>
                    <div className={styles.sortableItemsWrapper}>
                        {columns.filter(col => !col.isHidden).map(col => {
                            return <SortableItem key={col.name} column={col} editColumnsModel={editColumnsModel} />
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    </Panel>
}

