import React, { useEffect } from 'react';
import { Dialog as DialogBase } from '@fluentui/react/lib/Dialog';
import { IDialogProps } from './interfaces';
import { defaultProps } from './Constants';
import { getRootStyles } from './Styles';

const Dialog: React.FC<IDialogProps> = (props) => {
    return (
        <DialogBase
            {...props}
            modalProps={{
                ...props.modalProps,
                allowTouchBodyScroll: props.modalProps?.allowTouchBodyScroll ?? matchMedia('(hover: none)').matches ? true : undefined,
                className: `${props.modalProps?.className} ${getRootStyles(props)}`
            }}
        >
            {props.children}
        </DialogBase>
    );
};
export default Dialog;
Dialog.defaultProps = defaultProps;