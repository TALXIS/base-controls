import { useMemo } from "react";
import { EditColumns as EditColumnsComponent } from "../../../../wip/edit-columns/EditColumns";
import { useModel } from "../../useModel";
import { getLabels } from "../../../../wip/edit-columns/functions/getLabels";
import { EditColumnsContext } from "../../../../wip/edit-columns/context";

interface IEditColumnsProps {
    onDismiss: () => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const model = useModel();
    const labels = model.getLabels();
    const datasetControl = model.getDatasetControl();
    const provider = datasetControl.getDataset().getDataProvider();
    const editColumnsModel = useMemo(() => datasetControl.editColumns, []);
    const { onDismiss } = { ...props };

    const getEditColumnsPanelHeaderText = () => {
        const collectionName = provider.getMetadata().DisplayCollectionName;
        let title = labels['edit-columns']();
        if (collectionName) {
            title += `: ${collectionName}`;
        }
        return title;
    }
    return <EditColumnsContext.Provider value={editColumnsModel}>
        <EditColumnsComponent
            functions={{
                getLabels: () => {
                    const originalLabels = getLabels();
                    return {
                        ...originalLabels,
                        header: getEditColumnsPanelHeaderText(),
                        "add-column": labels['add-column'](),
                        "no-results": 'CUSTOM TEST',
                        "column-source": labels["column-source"](),
                        "no-name": labels["no-name"]()
                    }
                }
            }}
        />
    </EditColumnsContext.Provider>
}