import { IconButton, useTheme } from "@fluentui/react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { getArrowButtonStyles } from "./styles";
import React from 'react';

interface IArrowButtonsProps {
    onIncrement: () => void;
    onDecrement: () => void;
}

export interface IArrowButtons {
    setActiveBtn: (direction: 'up' | 'down') => void;
}

export const ArrowButtons = forwardRef<IArrowButtons, IArrowButtonsProps>((props, ref) => {
    const theme = useTheme();
    const styles = useMemo(() => getArrowButtonStyles(theme), []);
    const [activeBtn, setActiveBtn] = useState<'up' | 'down' | undefined>(undefined);

    const getIconButtonClassNames = (type: 'up' | 'down') => {
        let classNames = `${styles.iconButton}`;
        if(activeBtn === type) {
            classNames += ` ${styles.iconButtonActive}`
        }
        return classNames;
    }
    useEffect(() => {
        if(!activeBtn) {
            return;
        }
        setTimeout(() => {
            setActiveBtn(undefined);
        }, 100)
    }, [activeBtn]);

    useImperativeHandle(ref, () => {
        return {
            setActiveBtn: setActiveBtn
        }
    });
    
    return <div className={styles.root}>
        <IconButton onClick={props.onIncrement} className={getIconButtonClassNames('up')} iconProps={{
            iconName: 'ChevronUpSmall'
        }} />
          <IconButton onClick={props.onDecrement} className={getIconButtonClassNames('down')} iconProps={{
            iconName: 'ChevronDownSmall'
        }} />
    </div>
});