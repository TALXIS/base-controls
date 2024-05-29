import { useState } from "react";
import { useGridInstance } from "../../../hooks/useGridInstance";
import { useRecordUpdateServiceController } from "../../../services/RecordUpdateService/controllers/useRecordUpdateServiceController";

interface ISaveBtnProps {
    disabled: boolean,
    text: string,
    iconName: string
}

interface ISave {
    isSaving: boolean,
    saveBtnProps: ISaveBtnProps,
    save: () => Promise<boolean>
}

export const useSave = (): ISave => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const controller = useRecordUpdateServiceController();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const save = async (): Promise<boolean> => {
        setIsSaving(true);
        const result = await controller.saveAll();
        setIsSaving(false);
        return result;
    }

    const getSaveBtnProps = (): ISaveBtnProps => {
        if (isSaving) {
            return {
                disabled: true,
                iconName: 'SaveInPropgre',
                text: labels["saving-saving"](),
            }
        }
        if (controller.isDirty) {
            return {
                disabled: (controller.hasInvalidRecords || grid.props.parameters.ChangeEditorMode?.error) ? true : false,
                iconName: 'Save',
                text: labels["saving-save"]()

            }
        }
        return {
            disabled: true,
            iconName: 'Save',
            text: labels["saving-save"]()
        }
    }

    return {
        isSaving: isSaving,
        saveBtnProps: getSaveBtnProps(),
        save: save
    }

}