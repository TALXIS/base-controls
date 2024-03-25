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