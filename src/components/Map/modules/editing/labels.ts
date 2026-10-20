import { IMapModuleLabels, IMapModuleTranslations } from '../useModuleLabels';

export const editingLabels = {
    savingRecord: {
        1033: "Saving...",
        1029: "Ukládání..."
    }
};

export type IMapEditingTranslations = IMapModuleTranslations<typeof editingLabels>;
export type IMapEditingLabels = IMapModuleLabels<typeof editingLabels>;
