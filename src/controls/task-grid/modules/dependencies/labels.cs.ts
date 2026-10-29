import { translateLabels } from "@utils";
import { DEPENDENCIES_LABELS } from "./labels";

export const DEPENDENCIES_LABELS_CS = translateLabels(DEPENDENCIES_LABELS, {
    'dependencies.predecessors': 'Předchůdci',
    'dependencies.successors': 'Následníci',
    'dependencies.creatingDependency': 'Vytváření závislosti...',
    'dependencies.savingDependency': 'Ukládání závislosti...',
    'dependencies.deletingDependency': 'Odstraňování závislosti...',
    'dependencies.dependenciesFailed': 'Závislost se nepodařilo uložit.',
    'dependencies.loadDependenciesFailed': 'Závislosti se nepodařilo načíst.',
});
