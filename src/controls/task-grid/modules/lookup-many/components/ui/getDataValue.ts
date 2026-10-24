import type { IEntityReference } from "@talxis/client-libraries";

/** A value from the data a reference carries, such as the picked record's fields. */
export const getDataValue = (reference: IEntityReference<Record<string, string>>, propertyName: string): string | undefined => {
    return reference.data?.[propertyName];
};
