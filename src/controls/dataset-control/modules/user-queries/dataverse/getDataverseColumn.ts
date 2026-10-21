import { FetchXmlParser, IColumn, ILinkEntityExposedExpression } from "@talxis/client-libraries";

/** A column of the entity as Dataverse defines it, or `null` when Dataverse no longer has it. */
export const getDataverseColumn = async (entityName: string, columnName: string, linking: ILinkEntityExposedExpression[] = []): Promise<IColumn | null> => {
    try {
        const { columns } = await new FetchXmlParser().parse(`<fetch><entity name="${entityName}" /></fetch>`, [{ name: columnName }], linking);
        const column = columns.find(column => column.name === columnName);
        //an attribute Dataverse no longer has comes back unnamed
        return column?.displayName ? column as IColumn : null;
    }
    //a related column whose link is missing
    catch {
        return null;
    }
};
