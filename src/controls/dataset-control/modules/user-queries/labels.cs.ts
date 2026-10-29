import { translateLabels } from "@utils";
import { USER_QUERIES_LABELS } from "./labels";

export const USER_QUERIES_LABELS_CS = translateLabels(USER_QUERIES_LABELS, {
    'userQueries.myViewsHeader': 'Moje zobrazení',
    'userQueries.saveChanges': 'Uložit změny',
    'userQueries.saveAsNewView': 'Uložit jako nové zobrazení',
    'userQueries.manageViews': 'Spravovat zobrazení',
    'userQueries.viewName': 'Název',
    'userQueries.save': 'Uložit',
    'userQueries.delete': 'Odstranit',
    'userQueries.confirmDeleteViews': 'Chcete odstranit vybraná zobrazení?',
    'userQueries.close': 'Zavřít',
    'userQueries.saveFailed': 'Zobrazení se nepodařilo uložit.',
    'userQueries.deleteFailed': 'Zobrazení se nepodařilo odstranit.',
});
