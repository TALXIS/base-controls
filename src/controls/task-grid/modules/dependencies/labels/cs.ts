import { translateLabels } from "@labels";
import { DEPENDENCIES_LABELS } from "./en";

export const DEPENDENCIES_LABELS_CS = translateLabels(DEPENDENCIES_LABELS, {
    'dependencies.predecessors': 'Předchůdci',
    'dependencies.successors': 'Následníci',
    'dependencies.dependenciesFailed': 'Závislost se nepodařilo uložit.',
    'dependencies.loadDependenciesFailed': 'Závislosti se nepodařilo načíst.',
});
