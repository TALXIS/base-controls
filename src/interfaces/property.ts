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

export interface ITwoOptionsProperty extends Omit<ComponentFramework.PropertyTypes.Property, 'type' | 'error' | 'errorMessage'> {
    type?: string;
    error?: boolean;
    errorMessage?: string;
}