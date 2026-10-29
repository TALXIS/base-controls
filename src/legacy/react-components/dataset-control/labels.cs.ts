import { translateLabels } from "@utils";
import { LEGACY_DATASET_CONTROL_LABELS } from "./labels";

export const LEGACY_DATASET_CONTROL_LABELS_CS = translateLabels(LEGACY_DATASET_CONTROL_LABELS, {
    'legacyDatasetControl.search': "Vyhledat",
    'legacyDatasetControl.records': "záznamy",
    'legacyDatasetControl.noName': "(Bez názvu)",
    'legacyDatasetControl.columnSource': "Zdroj sloupců",
    'legacyDatasetControl.noResultFound': "Nebyly nalezeny žádné výsledky.",
    'legacyDatasetControl.addColumn': "Přidat sloupec",
    'legacyDatasetControl.customColumn': "Uživatelský sloupec",
    'legacyDatasetControl.cancel': "Zrušit",
    'legacyDatasetControl.editColumns': "Upravit sloupce",
    'legacyDatasetControl.editFilters': "Upravit filtry",
    'legacyDatasetControl.save': "Uložit",
    'legacyDatasetControl.generalError': "Během načítání ovládacího prvku došlo k nečekané chybě",
    'legacyDatasetControl.reload': "Obnovit",
    'legacyDatasetControl.unsavedChanges': "Počet upravených záznamů: <b>{{ numOfChanges }}</b>.",
    'legacyDatasetControl.savingDiscardAllConfirmation': "Tato akce zruší všechny neuložené změny. Chcete pokračovat?",
    'legacyDatasetControl.pagingOf': "z",
    'legacyDatasetControl.pagingFirstPage': "První strana",
    'legacyDatasetControl.pagingPreviousPage': "Předchozí",
    'legacyDatasetControl.pagingPage': "Strana",
    'legacyDatasetControl.pagingNextPage': "Další",
    'legacyDatasetControl.pagingLastPage': "Poslední strana",
    'legacyDatasetControl.pagingPages': "{{ start }} - {{ end }}",
    'legacyDatasetControl.pagingPagesTotalCount': "z {{ recordcount }}",
    'legacyDatasetControl.pageRecordCount': "Počet záznamů na stránce",
    'legacyDatasetControl.quickFindLikeWarning': "Pokud chcete výsledky získat rychleji, nezačínejte hvězdičkou (*)",
    'legacyDatasetControl.quickFindSearchUseFilter': "Použít filtr",
    'legacyDatasetControl.quickFindSearchStartsWith': "začíná na",
    'legacyDatasetControl.quickFindSearchOnTheseColumns': "na tyto sloupce:"
});
