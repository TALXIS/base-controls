type ExcludedProps = Pick<ComponentFramework.PropertyTypes.Property, 'formatted'>;

export interface IProperty extends Omit<Partial<ComponentFramework.PropertyTypes.Property>, keyof ExcludedProps | 'attributes'> {
}

export interface IStringProperty extends IProperty, Partial<ComponentFramework.PropertyTypes.StringProperty> {
    raw: string | null;
}

export interface ITwoOptionsProperty extends IProperty, Omit<Partial<ComponentFramework.PropertyTypes.TwoOptionsProperty>, 'attributes'> {
    raw: boolean,
    attributes: Omit<Partial<ComponentFramework.PropertyHelper.FieldPropertyMetadata.OptionSetMetadata>, 'DefaultValue'> & {
        Options: [ComponentFramework.PropertyHelper.OptionMetadata, ComponentFramework.PropertyHelper.OptionMetadata]
    };
}

export interface IDecimalNumberProperty extends IProperty, Omit<Partial<ComponentFramework.PropertyTypes.DecimalNumberProperty>, 'attributes'> {
    raw: number | null;
    type: 'Whole.None' | 'Decimal',
    attributes?: Partial<ComponentFramework.PropertyHelper.FieldPropertyMetadata.DecimalNumberMetadata>
}

//@ts-ignore - IMEMode is mandatory, but no longer supported in modern browsers - https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-field-portal
export interface IDateTimeProperty extends IProperty, Partial<ComponentFramework.PropertyTypes.DateTimeProperty> {
    raw: Date | null,
    attributes: Partial<ComponentFramework.PropertyHelper.FieldPropertyMetadata.DateTimeMetadata> & {
        Behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior
        Format: string;
    };
}

export interface IOptionSetProperty extends IProperty, Omit<Partial<ComponentFramework.PropertyTypes.OptionSetProperty>, 'attributes'> {
    raw: number | null,
    attributes: Partial<ComponentFramework.PropertyHelper.FieldPropertyMetadata.OptionSetMetadata> & {
        DefaultValue: number;
        Options: ComponentFramework.PropertyHelper.OptionMetadata[]
    };
}

export interface IMultiSelectOptionSetProperty extends IProperty, Omit<Partial<ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty>, 'attributes'> {
    raw: number[] | null,
    attributes: Partial<ComponentFramework.PropertyHelper.FieldPropertyMetadata.OptionSetMetadata> & {
        DefaultValue: number;
        Options: ComponentFramework.PropertyHelper.OptionMetadata[]
    };
}

export interface ILookupProperty extends IProperty, Partial<ComponentFramework.PropertyTypes.LookupProperty> {
    raw: ComponentFramework.LookupValue[];
    attributes: ComponentFramework.PropertyHelper.FieldPropertyMetadata.LookupMetadata;
    /**
     * Returns the default lookup viewId.
     */
    getDefaultViewId: (entityName: string) => string,
    /**
     * Gets all views for entity (including non-lookup ones).
     */
    getAllViews: (entityName: string) => {
        isAvailableInOffline: boolean;
        isDefault: boolean;
        isPinned: boolean;
        isUserView: boolean;
        relatedEntityName: string;
        viewId: string;
        viewName: string;
    }[]
}