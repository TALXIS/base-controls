import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import React from 'react';
import { getMultistageStyles } from "./styles";
import { Text } from "@fluentui/react";
import { IButtonProps } from "@fluentui/react";
import { BaseButton } from "@fluentui/react";
import { Button } from "@fluentui/react";
import { IconButton } from "@fluentui/react";
import { TooltipHost } from "@fluentui/react";
import { Icon } from "@fluentui/react";
import { IndicatorService } from "./IndicatorService";
import { IMessageBarProps } from "@fluentui/react";
import { useTheme } from "@fluentui/react";
import { MessageBar } from "@fluentui/react";
import { PrimaryButton } from "@fluentui/react";


export enum StageValue {
    invalid = "invalid",
    valid = "valid",
    in_progress = "in_progress",
    inactive = "inactive",
    warning = "warning"
}

export interface IStageState {
    /**  
     * Key that matches the state with it's stage
    */
    stageKey: string;
    /**  
     * Current state value of the given stages. You can choose from the predefined values or provide your own by passing a string.
    */
    value: StageValue | string;
    /**  
     * Props for the message that can appear in the header of each stage.
    */
    messageProps?: {
        message?: string;
        messageBarProps?: IMessageBarProps;
        onRender?: () => ReactElement;
    }
}

export interface IStage {
    /**  
     * Unique key for each stage.
    */
    key: string;
    label?: string;
    onRender(): ReactElement;
    onRenderHeader?(stageState: IStageState, defaultRenderer: () => ReactElement): ReactElement;
}

export interface IMultistageFooterProps {
    /**  
     * Can be used to set the props of next/previous/submit buttons.
    */
    previousButtonProps?: IButtonProps;
    nextButtonProps?: IButtonProps;
    submitButtonProps?: IButtonProps;
    /**  
     * Custom render method allowing you render your own footer.
    */
    onRender?: (footerProps: {
        showPreviousButton:boolean, 
        showNextButton: boolean, 
        showSubmitButton: boolean, 
        goToPreviousStage: () => void, 
        goToNextStage: () => void,
        submit: () => void;
    }) => ReactElement;
}

export interface IMultistageProps {
    /**  
     * Key of the current stage, matching stage will get highlighted in the header.
    */
    currentStageKey: string;
    /**  
     * An array of stages.
    */
    stages: IStage[];
    /**  
     * An array of stageStates.
    */
    stageStates: IStageState[];
    /**  
     * Fires every time a stage is about to be changed. This method can be used to implement stage validation.
     * @param {string} nextStageKey Key of the stage that the user wants to access
     * @param {boolean} goesToPreviousStage Defines if the stage that the user wants to access is positioned before the currently selected step. 
     * Can be useful during validation.
    */
    onStageChange: (nextStageKey: string, goesToPreviousStage: boolean) => void;
    /**  
     * Can be used to set the props of next/previous/submit buttons.
     * for more information.
    */
    footerProps?: IMultistageFooterProps;
    /**  
     * Defines a fixed height of body for all stages. Prevents "jumping" when some stages have different 
     * height than other.
    */
    bodyHeight?: string;
}

export const Multistage: React.FC<IMultistageProps> = (props) => {
    const headerProgressRef = useRef<HTMLDivElement>(null);
    const indicatorService = new IndicatorService(headerProgressRef);
    const [stageStates, setStageStates] = useState<IStageState[]>(props.stageStates);
    const theme = useTheme();

    const rootStyles = useMemo(() => {
        return getMultistageStyles(props.stages.length, theme, props.bodyHeight);
    }, [props.stages, props.bodyHeight, theme]);

    useEffect(() => {
        setStageStates(props.stageStates);
    }, [props.stageStates]);

    useEffect(() => {
        indicatorService.setActiveIndicatorPosition(true);
    }, [stageStates]);



    useEffect(() => {
        const progressResizeObserver = new ResizeObserver((entry) => {
            indicatorService.setActiveIndicatorPosition()
        });
        progressResizeObserver.observe(headerProgressRef.current as Element);
        return () => {
            progressResizeObserver.disconnect()
        };
    }, []);


    const getStageState = (stage: IStage | undefined): IStageState | undefined => {
        const foundStage = stageStates.find(state => state.stageKey === stage?.key);
        return foundStage;
    };

    const getCurrentStage = (): [IStage | undefined, IStageState | undefined] => {
        const currentStageState = stageStates.find(stage => stage.stageKey === props.currentStageKey);
        const currentStage = props.stages.find(stage => stage.key === props.currentStageKey);
        return [currentStage, currentStageState];
    };

    const getPreviousStage = (): IStage | undefined => {
        const [currentStage] = getCurrentStage();
        if (!currentStage) {
            return;
        }
        const previousStageIndex = props.stages.findIndex(stage => stage.key === currentStage?.key) - 1;
        return props.stages[previousStageIndex];
    }
    const getNextStage = (): IStage | undefined => {
        const [currentStage] = getCurrentStage();
        if (!currentStage) {
            return;
        }
        const nextStageIndex = props.stages.findIndex(stage => stage.key === currentStage?.key) + 1;
        return props.stages[nextStageIndex];
    }

    const submit = (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) => {
        if (props.footerProps?.submitButtonProps?.onClick) {
            props.footerProps.submitButtonProps.onClick(e!);
        }
    };

    const goToStage = (nextStage: IStage | undefined, manualSkip?: boolean) => {
        const nextStageState = getStageState(nextStage);
        const [currentStage] = getCurrentStage();
        const currentStageIndex = props.stages.findIndex(stage => stage.key === currentStage?.key);
        const nextStageIndex = props.stages.findIndex(stage => stage.key === nextStage?.key);

        if (nextStageState?.value === StageValue.inactive && manualSkip) {
            return;
        }
        if (!nextStage) {
            return;
        }
        
        props.onStageChange(nextStage.key, nextStageIndex < currentStageIndex);
    };

    const goToNextStage = (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) => {
        if (props.footerProps?.nextButtonProps?.onClick && !props.footerProps?.onRender) {
            props.footerProps?.nextButtonProps.onClick(e!);
        }
        const nextStage = getNextStage();
        goToStage(nextStage)
    }
    const goToPreviousStage = (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>): void => {
        if (props.footerProps?.previousButtonProps?.onClick && !props.footerProps?.onRender) {
            props.footerProps?.previousButtonProps.onClick(e!);
        }
        const previousStage = getPreviousStage();
        goToStage(previousStage);
    }

    const getIconName = (stage: IStage): string | undefined => {
        const stageState = getStageState(stage);
        if (stageState?.value === StageValue.invalid) {
            return 'Cancel';
        }
        if (stageState?.value === StageValue.valid) {
            return 'CheckMark';
        }
        if(stageState?.value === StageValue.warning) {
            return 'Warning'
        }
    }
    const renderMessage = () => {
        const [currentStage, currentStageState] = getCurrentStage();
        const messageProps = currentStageState?.messageProps;
        if (messageProps) {
            if (messageProps.onRender) {
                return messageProps.onRender()
            }
            return (
                <div className="TALXIS__Multistage__header__error">
                    <MessageBar {...messageProps.messageBarProps}>
                        {currentStageState.messageProps?.message}
                    </MessageBar>
                </div>
            )
        }
    }
    const showNextButton = (): boolean => {
        if (!getNextStage()) {
            return false;
        }
        if(props.footerProps?.nextButtonProps?.hidden) {
            return false;
        }
        return true;
    };

    const showPreviousButton = (): boolean => {
        if (!getPreviousStage()) {
            return false;
        }
        if(props.footerProps?.previousButtonProps?.hidden) {
            return false;
        }
        return true;
    };
    const showSubmitButton = (): boolean => {
        const [currentStage] = getCurrentStage();
        if(!currentStage) {
            return false;
        }
        if(props.footerProps?.submitButtonProps?.hidden) {
            return false;
        }
        if (currentStage?.key !== props.stages[props.stages.length - 1].key) {
            return false;
        }
        return true;
    };
    const renderHeader = () => {
        const defaultRenderer = (stage: IStage) => {
            return (
                <TooltipHost content={stage.label}>
                    <Text>{stage.label}</Text>
                    {(stage.key !== props.currentStageKey) &&
                        <Icon className='TALXIS__Multistage__header__state-icon' iconName={getIconName(stage)} />
                    }
                </TooltipHost>
            );
        }
        return (
            <div className="TALXIS__Multistage__header">
                <div ref={headerProgressRef} className="TALXIS__Multistage__header__progress">
                    {props.stages.map((stage, i) =>
                        <div onClick={() => goToStage(stage, true)} key={i} 
                            data-current={stage.key === props.currentStageKey ? true : undefined} 
                            data-state={getStageState(stage)?.value}>
                            <div />
                            {!stage.onRenderHeader ?
                                defaultRenderer(stage)
                                :
                                stage.onRenderHeader(getStageState(stage)!, () => defaultRenderer(stage))}
                        </div>)}
                </div>
                {renderMessage()}
            </div>
        )
    }
    const renderStage = (): ReactElement => {
        const [currentStage] = getCurrentStage();
        return (
            <div className="TALXIS__Multistage__body">
                {currentStage?.onRender()}
            </div>
        );
    }
    const renderFooter = () => {
        if (props.footerProps?.onRender) {
            return props.footerProps?.onRender({
                showNextButton: showNextButton(),
                showPreviousButton: showPreviousButton(),
                showSubmitButton: showSubmitButton(),
                goToNextStage: goToNextStage,
                goToPreviousStage: goToPreviousStage,
                submit: submit
            });
        }
        return (
            <div className="TALXIS__Multistage__footer">
                {showPreviousButton() &&
                    <IconButton iconProps={{
                        iconName: 'SkypeCircleArrow'
                    }} {...props.footerProps?.previousButtonProps} onClick={goToPreviousStage} />
                }
                {showNextButton() &&
                    <IconButton data-icon-next={true} iconProps={{
                        iconName: 'SkypeCircleArrow'
                    }} {...props.footerProps?.nextButtonProps} onClick={goToNextStage} />
                }
                {showSubmitButton() &&
                    <PrimaryButton
                        data-button-submit={true}
                        {...props.footerProps?.submitButtonProps}
                        onClick={(e) => submit(e)}>
                            {props.footerProps?.submitButtonProps?.label || 'Submit'}
                    </PrimaryButton>
                }
            </div>
        );
    }
    return (
        <div className={rootStyles}>
            {renderHeader()}
            {renderStage()}
            {renderFooter()}
        </div>
    );
};