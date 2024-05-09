import * as React from 'react';
import { Callout, IconButton, PrimaryButton, Button, ICalloutProps } from '@fluentui/react';
import { Text } from '@fluentui/react/lib/Text';
import { filterCalloutStyles } from './styles';
import { useColumnFilterConditionController } from '../../controller/useColumnFilterConditionController';
import { IGridColumn } from '../../../core/interfaces/IGridColumn';
import { FilteringUtils } from '../../utils/FilteringUtilts';
import { ConditionOperator } from './components/ConditionOperator/ConditionOperator';
import { ConditionValue } from './components/ConditionValue/ConditionValue';

export interface IFilterCallout extends ICalloutProps {
    column: IGridColumn;
    onDismiss: () => void;
}

export const FilterCallout = (props: IFilterCallout) => {
    const {column, onDismiss} = {...props};
    const condition = useColumnFilterConditionController(column);
    const conditionOperator = condition?.operator.get();
    const conditionValue = condition?.value.get();
    const conditionUtils = FilteringUtils.condition();
    const isDeleteButtonDisabled = () => {
        switch(conditionValue) {
            case null:
            case undefined:
            case "": {
                return true;
            }
        }
        return false;
    }

    React.useEffect(() => {
        return () => {
            condition?.clear()
        }
    }, []);

    return (
        <Callout
            {...props}
            calloutWidth={230}
            className={filterCalloutStyles.root}>
            <div className={filterCalloutStyles.header}>
                <Text className={filterCalloutStyles.title} variant="mediumPlus">Filtrovat podle</Text>
                <IconButton onClick={() => onDismiss()} iconProps={{
                    iconName: 'ChromeClose',
                }} />
            </div>
            {condition &&
                <>
                    <div className={filterCalloutStyles.controls}>
                        <ConditionOperator column={column} />
                        {conditionUtils.value(conditionOperator!).isEditable &&
                        <ConditionValue
                            column={column} />
                        }
                    </div>
                    <div className={filterCalloutStyles.footer}>
                        <PrimaryButton text="Pouzit"
                            onClick={async () => {
                                if(await condition.save()) {
                                    props.onDismiss();
                                }
                            }} />
                        {conditionUtils.value(conditionOperator!).isEditable &&
                            <Button text="Vymazat"
                                disabled={isDeleteButtonDisabled()}
                                onClick={() => {
                                    condition.value.set(null);
                                }} />
                        }
                    </div>
                </>
            }
        </Callout>
    );
};