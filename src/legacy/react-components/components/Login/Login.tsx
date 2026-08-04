
import { BaseButton } from "@fluentui/react";
import { Button } from "@fluentui/react";
import { IButtonProps } from "@fluentui/react";
import { CommandBarButton } from "@fluentui/react";
import { Callout } from "@fluentui/react";
import { Persona } from "@fluentui/react";
import { IPersonaProps} from "@fluentui/react";
import { Text } from "@fluentui/react";
import { ICalloutProps as ICalloutPropsBase } from "@fluentui/react";
import * as React from 'react';
import { getLoginCalloutStyles, getLoginStyles } from './styles';
import { Link } from "@fluentui/react";
import { ILinkProps } from "@fluentui/react";

export interface ILoginProps extends IButtonProps {
    personaProps?: IPersonaProps;
    calloutProps?: ICalloutProps;
}

export interface ICalloutProps extends ICalloutPropsBase {
    personaProps?: IPersonaProps;
    headerTextProps?: string;
    headerButtonProps?: IButtonProps;
    footerButtonsProps?: IFooterButtonProps[];
    links?: ILinkProps[];
}

export interface IFooterButtonProps extends IButtonProps {
    personaProps?: IPersonaProps;
}

export const Login: React.FC<ILoginProps> = (props) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [calloutVisible, setCalloutVisibility] = React.useState<boolean>(false);

    const calloutStyles = React.useMemo(() => {
        return getLoginCalloutStyles(props.calloutProps?.className);
    }, [props.calloutProps?.className]);

    const styles = React.useMemo(() => {
        return getLoginStyles(props.className)
    }, [props.className]);

    const onButtonClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) => {
        if (props?.onClick) {
            props.onClick(e);
        }
        setCalloutVisibility(!calloutVisible);
    };

    const onCalloutDismiss = (e: Event | React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
        if (props.calloutProps?.onDismiss) {
            props.calloutProps.onDismiss(e)
        }
        setCalloutVisibility(false);
    }
    return (
        <CommandBarButton className={styles} {...props} elementRef={ref} onClick={onButtonClick}>
            <Persona {...props.personaProps} />
            {calloutVisible && props.calloutProps &&
                <Callout
                    calloutWidth={props.calloutProps?.calloutWidth ?? 320}
                    target={ref}
                    className={calloutStyles}
                    onDismiss={onCalloutDismiss}>
                    <div>
                        <Text>{props.calloutProps?.headerTextProps ?? ""}</Text>
                        {props.calloutProps?.headerButtonProps &&
                            <CommandBarButton {...props.calloutProps?.headerButtonProps} />
                        }
                    </div>
                    <Persona
                        {...props.personaProps}
                        {...props.calloutProps?.personaProps}
                        onRenderTertiaryText={() => <>
                            {props.calloutProps?.links?.map(link => <Link {...link} />)}
                        </>} />
                    {props.calloutProps?.footerButtonsProps &&
                        <div className='TALXIS__Login--callout__footer'>
                            {props.calloutProps.footerButtonsProps.map(footerButtonProps => {
                                return (
                                    <CommandBarButton {...footerButtonProps}>
                                        <Persona {...footerButtonProps.personaProps} />
                                    </CommandBarButton>
                                );
                            })}
                        </div>
                    }
                </Callout>
            }
        </CommandBarButton>
    );
}