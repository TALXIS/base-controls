import { useMemo } from "react";
import { EditColumns as EditColumnsComponent } from "../../../../wip/edit-columns/EditColumns";
import { useModel } from "../../useModel";
import { PanelType } from "@fluentui/react";
import { getLabels } from "../../../../wip/edit-columns/functions/getLabels";

interface IEditColumnsProps {
    onDismiss: () => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const model = useModel();
    const labels = model.getLabels();
    const datasetControl = model.getDatasetControl();
    const provider = datasetControl.getDataset().getDataProvider();
    const editColumnsModel = useMemo(() => datasetControl.editColumns, []);
    const {onDismiss} = {...props};

    const getEditColumnsPanelHeaderText = () => {
        const collectionName = provider.getMetadata().DisplayCollectionName;
        let title = labels['edit-columns']();
        if (collectionName) {
            title += `: ${collectionName}`;
        }
        return title;
    }

    return <EditColumnsComponent
        model={editColumnsModel}
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
        panelProps={{
            overrideComponentProps: (panelProps) => {
                return {
                    ...panelProps,
                    type: PanelType.large
                }
            },
            functions: {
                onDismiss: onDismiss
            },

        }}
    />
}