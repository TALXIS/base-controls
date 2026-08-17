import { StylesConfig } from 'react-select';

export const getMultiRecordSelectorStyles = (): StylesConfig<ComponentFramework.EntityReference, boolean, any> => {
    return {
        control: (base) => ({
            ...base,
            maxHeight: 200,
            overflow: 'auto',
            border: 'none',
            background: 'none',
            boxShadow: 'none',
        }),
    };
};
