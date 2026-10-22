import type { IAvailableRelatedColumn, IColumn, ILinkEntityExposedExpression } from "@talxis/client-libraries";

/** A column of a related entity, named and labelled as it is reached through the link. */
export const toScopedColumn = (column: IColumn, link: ILinkEntityExposedExpression, scope: IAvailableRelatedColumn): IColumn => ({ ...column, name: `${link.alias}.${column.name}`, displayName: `${column.displayName} (${scope.displayName})` });
