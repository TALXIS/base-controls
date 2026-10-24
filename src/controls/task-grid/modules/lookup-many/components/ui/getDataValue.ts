/** A field of the record a reference was picked from, as its raw data carries it. */
export const getRawValue = (reference: ComponentFramework.EntityReference, propertyName: string): string | undefined => {
    return (reference as ComponentFramework.EntityReference & { rawData?: Record<string, string> }).rawData?.[propertyName];
};
