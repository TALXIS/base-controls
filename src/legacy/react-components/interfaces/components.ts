import { ITheme } from "@fluentui/react";
import { ICommandBarItemProps } from "../components/CommandBar/CommandBar";

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**  
    For components that have a read only variant. The read only mode should disable any attempts to change the component's value, but any action buttons present (apart for buttons that change the component's value) should be enabled.
*/
export interface IReadOnly {
    /**  
     * Will disable any inputs that are part of the component.
    */
    readOnly?: boolean;
}
/**  
    For components that can be disabled, meaning that they can't be interacted with.
*/
export interface IDisabled {
    /**  
     * Puts the component into disabled mode, meaning that the component will not be interactive.
    */
    disabled?: boolean;
}
/**  
    For components, that can have an N number of action buttons before component's main content. These buttons should be active by default in read only mode and disabled while the component is in disabled state. Please refer to the TextField component for guidance on how to implement this interface.
*/
export interface IPrefix {
    /**  
    * Array of buttons displayed in component's prefix.
   */
    prefixItems?: ICommandBarItemProps[];
}
/**  
    For components, that can have an N number of action buttons after component's main content. These buttons should be active by default in read only mode and disabled while the component is in disabled state Please refer to the TextField component for guidance on how to implement this interface.
*/
export interface ISuffix {
    /**  
     * Array of buttons displayed in component's suffix.
    */
    suffixItems?: ICommandBarItemProps[];
}
/**  
    For components that have a copy button. The copy button should be active by default in read only mode and disabled while the component is in disabled state. Also, the copy button should only be visible when the component's value is not empty (eg, if there is something to copy). If used along with the `ISuffix` interface, the copy button should be a part of the suffix items.
*/
export interface ICopyButton {
    /**  
     * Adds button to suffix that copies the component's value to clipboard.
    */
    clickToCopyProps?: ICommandBarItemProps & {
        successText?: string;
        getValueToCopy?: () => string | undefined;
    }
}
/**  
    For components that have a delete button. The delete button should not be visible when the component's value is empty (eg, if there is nothing to delete) or the component is in the read only mode. The button should also appear disabled while the component is in disabled state. If used along with the `ISuffix` interface, the delete button should be a part of the suffix items. It should also be the last item. Remember that all buttons (this includes `IPrefix`, `ISuffix`, `ICopyButton` and `IDeleteButton`) should have a fade in animation if the `showOnlyOnHover` prop is set to true!
*/
export interface IDeleteButton {
    /**  
    * Adds button to suffix that clears the component's value. If the component is controlled, you still need to clear the value manually by using the `onClick` function
   */
    //TODO: deleteButtonProps: ICommandBarItemProps;
    deleteButtonProps?: ICommandBarItemProps;
}
/**  
    For components that can show an error message. You can you the predefined ``<ErrorMessage>`` component to make this implementation easier. The component should also have a red border around it if possible (even in disabled state).
*/
export interface IErrorMessage {
    /**
     * Will appear below the component if specified.
    */
    errorMessage?: string;
    /**  
     * Will hide the error message while keeping the error outline.
    */
    hideErrorMessage?: boolean;
}

