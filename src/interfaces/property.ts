export interface IStringProperty extends Omit<ComponentFramework.PropertyTypes.StringProperty, 'type' | 'error' | 'errorMessage'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface IProperty extends Omit<ComponentFramework.PropertyTypes.Property, 'type' | 'error' | 'errorMessage'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface ITwoOptionsProperty extends Omit<ComponentFramework.PropertyTypes.TwoOptionsProperty, 'type' | 'error' | 'errorMessage'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}

export interface IDecimalNumberProperty extends Omit<ComponentFramework.PropertyTypes.DecimalNumberProperty, 'type' | 'error' | 'errorMessage'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}