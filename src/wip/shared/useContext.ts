import { useContext as useReactContext } from 'react';

export const useContext = <T>(name: string, context: React.Context<T>) => {
    const result = useReactContext(context);
    
    if(result == null) {
        throw new Error(`Context for component ${name} is not provided. Make sure to wrap the component in the corresponding context provider.`);
    }
    return result;
}