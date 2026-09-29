import { Attribute, IColumn, IDataset, ILinkEntityExposedExpression } from '@talxis/client-libraries';
import { getAttributePathLinking, isLinkedAttributePath } from './attributes';

/** Order given to a column the control adds itself, so it sorts behind everything the view configured. */
const ADDED_COLUMN_ORDER = 10000;

/**
 * Adds the link entities and columns a set of dot notation attribute paths needs to the bound dataset - a
 * path across a link entity only resolves once the dataset links that entity and carries the column under
 * the aliased name, which a view configured without the Map in mind does not. Added columns are hidden, so
 * a sibling control on the same dataset does not start showing them.
 */
export const registerLinkedMapAttributes = async (dataset: IDataset, paths: string[]): Promise<boolean> => {
    const provider = dataset.getDataProvider();
    const columns = provider.getColumnsMap();
    const missing = paths.filter((path) => isLinkedAttributePath(path) && !columns[path]);
    if (!missing.length) {
        return false;
    }

    const relatedColumns = await provider.getAvailableRelatedColumns();
    if (!relatedColumns.length) {
        return false;
    }

    const linking: ILinkEntityExposedExpression[] = [...provider.getLinking()];
    const added: IColumn[] = [];
    //one lookup per related entity, however many paths reach into it
    const availableColumnsByEntity = new Map<string, IColumn[]>();

    for (const path of missing) {
        const alias = Attribute.GetLinkedEntityAlias(path);
        const relatedColumn = relatedColumns.find((column) => column.name === alias);
        if (!relatedColumn) {
            console.warn(`Map: "${path}" names a lookup the dataset cannot link through, so it stays unresolved.`);
            continue;
        }
        const link = getAttributePathLinking(path, relatedColumns, linking);
        if (link) {
            linking.push(link);
        }
        const entityName = relatedColumn.relatedEntityName;
        if (!availableColumnsByEntity.has(entityName)) {
            availableColumnsByEntity.set(entityName, await provider.getAvailableColumns({ entityName }));
        }
        const source = availableColumnsByEntity.get(entityName)?.find(
            (column) => column.name === Attribute.GetNameFromAlias(path)
        );
        if (!source) {
            console.warn(`Map: "${path}" names an attribute ${entityName} does not have, so it stays unresolved.`);
            continue;
        }
        added.push({ ...source, name: path, alias: path, isHidden: true, order: ADDED_COLUMN_ORDER + added.length });
    }

    if (!added.length) {
        return false;
    }
    provider.setLinking(linking);
    provider.setColumns([...provider.getColumns(), ...added]);
    await dataset.refresh();
    return true;
};
