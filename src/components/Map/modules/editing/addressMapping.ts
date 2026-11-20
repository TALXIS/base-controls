import { IAddress } from '@talxis/client-libraries';

/**
 * Attributes a resolved address is written back to.
 *
 * Every one is optional: a control configured with none still writes coordinates, and one configured with a
 * few writes only those. The legacy MapPicker's AdministrativeArea, Locality, Sublocality and StreetName
 * properties map onto `region`, `city`, `district` and `streetAndNumber`.
 */
export interface IMapAddressAttributes {
    /** The whole address on one line. */
    fullAddress?: string;
    country?: string;
    /** The region or state. */
    region?: string;
    /** The town or city. */
    city?: string;
    /** The district or neighbourhood within it. */
    district?: string;
    /** The street on its own, without its number. */
    street?: string;
    /** The street and its number together on one line - what a single address line field expects. */
    streetAndNumber?: string;
    streetNumber?: string;
    postalCode?: string;
}

/** Values to write onto a record, keyed by the attribute they belong to. */
export interface IMapAddressValues {
    [attribute: string]: string | number | null;
}

/** Composes the street and its number the way a single line street field expects them, e.g. "Václavské náměstí 846/1". */
export const getStreetLine = (address: IAddress): string | undefined => {
    const line = [address.street, address.streetNumber].filter(Boolean).join(' ').trim();
    return line || undefined;
};

/**
 * Works out what to write onto a record for a resolved address. A component the service could not resolve
 * is written as `null` rather than skipped, so moving a pin from a street address to the middle of a field
 * clears the street instead of leaving the old one behind.
 */
export const getAddressValues = (address: IAddress, attributes: IMapAddressAttributes): IMapAddressValues => {
    const components: [keyof IMapAddressAttributes, string | undefined][] = [
        ['fullAddress', address.text],
        ['country', address.country],
        ['region', address.administrativeArea],
        ['city', address.locality],
        ['district', address.subLocality],
        ['street', address.street],
        ['streetAndNumber', getStreetLine(address)],
        ['streetNumber', address.streetNumber],
        ['postalCode', address.postalCode]
    ];

    const values: IMapAddressValues = {};
    components.forEach(([component, value]) => {
        const attribute = attributes[component];
        if (attribute) {
            values[attribute] = value ?? null;
        }
    });
    return values;
};

/** Whether any address attribute is configured at all, which is what decides if a moved pin needs a lookup. */
export const hasAddressAttributes = (attributes: IMapAddressAttributes): boolean =>
    Object.values(attributes).some((attribute) => !!attribute);
