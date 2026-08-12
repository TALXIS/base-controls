import { ActionButton, CommandBarButton, DefaultButton, IButtonProps, IconButton, IRenderFunction, MessageBarButton, PrimaryButton, SpinnerSize, ThemeGenerator, useTheme } from '@fluentui/react';
import { useMemo } from 'react';
import { getButtonWithLoadingStyles } from './styles';
import { Spinner } from '@legacy/components/Spinner/Spinner';

export type ButtonComponent = typeof ActionButton | typeof CommandBarButton | typeof DefaultButton | typeof IconButton | typeof MessageBarButton | typeof PrimaryButton;

export interface IButttonWithLoadingProps extends IButtonProps {
    isLoading: boolean;
}

export const withButtonLoading = (ButtonComponent: ButtonComponent) => {
    return (props: IButttonWithLoadingProps) => {
        const isLoading = props.isLoading;
        const styles = useMemo(() => getButtonWithLoadingStyles(ButtonComponent), []);

        const getSpinnerSize = () => {
            if(ButtonComponent === MessageBarButton) {
                return SpinnerSize.xSmall;
            }
            return SpinnerSize.xSmall
        }

        const onRenderIcon = (): JSX.Element | null => {
            return <Spinner className={styles.spinner} size={getSpinnerSize()} />
        }

        const getClassName = () => {
            let className = '';
            if(props.className) {
                className += `${props.className} `
            }
            if(isLoading) {
                className += styles.root
            }
            return className;
        }

        return <ButtonComponent
            {...props}
            className={getClassName()}
            disabled={isLoading || props.disabled}
            onRenderIcon={isLoading ? onRenderIcon : props.onRenderIcon} />
    }
}