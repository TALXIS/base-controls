type ExcludedProps = Pick<ComponentFramework.PropertyTypes.StringProperty, 'type' | 'error' | 'errorMessage' | 'formatted'>;

export interface IStringProperty extends Omit<ComponentFramework.PropertyTypes.StringProperty, keyof ExcludedProps> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface IProperty extends Omit<ComponentFramework.PropertyTypes.Property, keyof ExcludedProps> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface ITwoOptionsProperty extends Omit<ComponentFramework.PropertyTypes.TwoOptionsProperty, keyof ExcludedProps> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface IDecimalNumberProperty extends Omit<ComponentFramework.PropertyTypes.DecimalNumberProperty, keyof ExcludedProps> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface ILookupProperty extends Omit<ComponentFramework.PropertyTypes.LookupProperty, keyof ExcludedProps | 'attributes' | 'getTargetEntityType' | 'getViewId'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
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