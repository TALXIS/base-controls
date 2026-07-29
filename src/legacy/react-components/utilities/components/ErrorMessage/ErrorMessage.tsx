import { IMessageBarProps, MessageBar, MessageBarType } from "@fluentui/react";
import React, { useState } from 'react';

export interface IErrorMessageComponent {
    errorMessage?: string | JSX.Element
    messageBarProps?: IMessageBarProps
}
const renderErrorMessage = (props: IErrorMessageComponent, setVisibility: React.Dispatch<React.SetStateAction<boolean>>): JSX.Element | undefined => {
    if (typeof props.errorMessage === 'string' || props.errorMessage instanceof String) {
        return (
            <MessageBar
                messageBarType={MessageBarType.error}
                {...props.messageBarProps}
                onDismiss={(e) => {
                    if (props.messageBarProps?.onDismiss) {
                        props.messageBarProps.onDismiss(e)
                    }
                    setVisibility(false)
                }}
            >
                {props.errorMessage}
            </MessageBar>);
    }
    return props.errorMessage;
};

export const ErrorMessage: React.FC<IErrorMessageComponent> = (props) => {
    const [visible, setVisibility] = useState<boolean>(true)
    if (props.errorMessage && props.errorMessage != '' && visible) {
        return (
            <div className={`TALXIS__error-message__root`}>
                {renderErrorMessage(props, setVisibility)}
            </div>
        );
    }
    return (null);

}

