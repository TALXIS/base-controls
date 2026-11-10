import { translateLabels } from "@labels";
import { LINKS_LABELS } from "./en";

export const LINKS_LABELS_CS = translateLabels(LINKS_LABELS, {
    'links.confirmDeleteLink': 'Odstranit závislost {{ predecessor }} → {{ successor }}?',
    'links.linkStart': ' (začátek)',
    'links.linkEnd': ' (konec)',
    'links.predecessor': 'Předchůdce',
    'links.successor': 'Následník',
    'links.finishToStart': 'Konec → začátek',
    'links.startToStart': 'Začátek → začátek',
    'links.finishToFinish': 'Konec → konec',
    'links.startToFinish': 'Začátek → konec',
    'links.refusedSelf': 'Úkol nemůže záviset sám na sobě.',
    'links.refusedDuplicate': 'Tyto úkoly už jsou propojené.',
    'links.refusedCycle': 'Toto propojení by vytvořilo smyčku.',
    'links.refusedSaving': 'Počkejte, až se tyto úkoly uloží.',
    'links.refused': 'Toto propojení nelze nakreslit.',
});
