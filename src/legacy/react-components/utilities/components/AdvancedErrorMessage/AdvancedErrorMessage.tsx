import { Icon } from "@fluentui/react";
import { Link } from "@fluentui/react";
import { MessageBar } from "@fluentui/react";
import { MessageBarType } from "@fluentui/react";
import * as React from "react";

export interface IErrorMessage {
    header?: string;
    text?: string;
    type?: MessageBarType;
    link?: {
        text: string;
        url: string;
        targetBlank?: boolean;
    };
    isMultiline?: boolean;
    allowRefresh?: boolean;
    rawError?: any;
    id?: string;
}

interface IState {
    messages: IErrorMessage[];
}
interface Props {
    messages: IErrorMessage[];
}

export class ErrorMessageComponentPCF extends React.Component<Props, IState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            messages: props.messages
        };
    }

    componentDidMount() {
        this.setState({ messages: this.props.messages });
    }

    componentDidUpdate(prevProps: Props | IState) {
        if (prevProps !== this.props) {
            this.setState({ messages: this.props.messages });
        }
    }

    render() {
        return (
            <div className="messages">
                {this.state.messages.map((message, i) =>
                    <MessageBar key={message.id ?? i} messageBarType={message.type || MessageBarType.info} isMultiline={message.isMultiline || false} dismissButtonAriaLabel="Close">
                        <b>{message.header}</b>
                        <b>{(message.header == null && message.link?.text == null) && "ERROR"}</b>
                        &nbsp;
                        {message.text !== '{}' && message.text !== null && message.text?.replace(/\"/g, '')}
                        &nbsp;
                        {message.link?.url && message.link?.text ? (
                            <Link href={message.link.url} target={message.link.targetBlank ? "_blank" : "_self"}>
                                {message.link.text}
                            </Link>
                        ) : ("")}
                        &nbsp;
                        {message.allowRefresh ? (
                            <Link onClick={() => { window.location.reload() }}>
                                <Icon iconName='Refresh' />&nbsp;Refresh Page
                            </Link>
                        ) : ("")}
                    </MessageBar>
                )}
            </div>
        );
    }
}