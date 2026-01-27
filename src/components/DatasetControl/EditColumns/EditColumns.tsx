import { CommandBar, DefaultButton, Label, Panel, PrimaryButton, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo, useRef, useState } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem/SortableItem";
import { EditColumnsModel, IEditColumnsEvents } from "./EditColumnsModel";
import { useEventEmitter } from "../../../hooks";
import { useRerender } from "@talxis/react-components";
import { ColumnSelector } from "./ColumnSelector/ColumnSelector";
import { useShouldRemount } from "../../../hooks/useShouldRemount";
import { ScopeSelector } from "./ScopeSelector/ScopeSelector";

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
    const labels = model.getLabels();
    const styles = useMemo(() => getEditColumnsStyles(theme), []);
    const editColumnsModel = useMemo(() => new EditColumnsModel({ datasetControl }), []);
    const columns = editColumnsModel.getColumns();
    const sensor = useSensor(PointerSensor);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();
    const [shouldRemountColumnSelector, remountColumnSelector] = useShouldRemount();
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnsChanged', rerender);
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onRelatedEntityColumnChanged', remountColumnSelector);
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnAdded', () => scrollableContainerRef.current?.scrollTo({ top: 0 }));


    const getTitle = () => {
        const collectionName = provider.getMetadata().DisplayCollectionName;
        let title = 'Edit Columns';
        if (collectionName) {
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
            <div className={styles.selectors}>
                <div className={styles.selector}>
                    <Label>{labels["column-source"]()}</Label>
                    <ScopeSelector editColumnsModel={editColumnsModel} />
                </div>
                {!shouldRemountColumnSelector &&
                    <div className={styles.selector}>
                        <ColumnSelector editColumnsModel={editColumnsModel} />
                    </div>
                }
            </div>
        </div>
        <div ref={scrollableContainerRef} className={styles.scrollableContainer}>
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

