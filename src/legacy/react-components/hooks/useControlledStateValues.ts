import { useEffect } from "react";
import { useStateValues } from "./useStateValues";

/**
 * This hook can be used to automatically track changes of PCF control state.
 *
 * @param {T} state - The current state that came as an attribute of `init` method.
 * @param {T} defaultValues - Default (initial) values for the state. These values won't be saved to state if not changed down the line.
 * @param {T} mode - PCF context mode object.
 * @return {MutableRefObject<T>} Returns a ref to an object that has been created as a merge of the passed state and default values.
 * This object should be used to write any state changes.
 * The hook makes sure that only relevant changes (eg. differences between the default values and existing state) get propagated to a new state object. 
 * This prevents bloating the state with too many unnecessary data. All changes written to the returned object will be automatically saved to state once your component gets unmounted.
 * Make sure to call `unmountComponentAtNode` within the `destroy` method to make sure that the component gets properly unmounted.
 */
export const useControlledStateValues = <T>(state: T, defaultValues: T, mode: ComponentFramework.Mode): React.MutableRefObject<T> => {
    const [stateValuesRef, getChangedStateValues] = useStateValues<T>(state, defaultValues);
    useEffect(() => {
        return () => {
            mode.setControlState(getChangedStateValues() as ComponentFramework.Dictionary);
        };
    }, []);

    return stateValuesRef;
};