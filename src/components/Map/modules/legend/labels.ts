import { IMapModuleLabels, IMapModuleTranslations } from '../useModuleLabels';

export const legendLabels = {
    legend: {
        1033: "Legend",
        1029: "Legenda"
    },
    legendCollapse: {
        1033: "Collapse the legend",
        1029: "Sbalit legendu"
    }
};

export type IMapLegendTranslations = IMapModuleTranslations<typeof legendLabels>;
export type IMapLegendLabels = IMapModuleLabels<typeof legendLabels>;
