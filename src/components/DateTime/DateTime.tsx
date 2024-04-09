
import { useComponent } from "../../hooks";
import { IDateTime } from "./interfaces";
import "react-datetime/css/react-datetime.css";
import { useState } from "react";

export const DateTime = (props: IDateTime) => {
    const context = props.context;
    const parameters = props.parameters;
    const value = parameters.value;
    const behavior = value.attributes.Behavior;
    const format = value.attributes.Format;
    const [isPickerOpened, setIsPickerOpened] = useState<boolean>(false);
    const [ notifyOutputChanged ] = useComponent(props);

    const formatValue = (): string | undefined => {
        if(!value.raw) {
            return undefined
        }
        if(format === 'DateAndTime') {
            return context.formatting.formatTime(value.raw, behavior);
        }
        return context.formatting.formatDateShort(value.raw);
    }

/*     return (
        <Datetime
            onOpen={() => setIsPickerOpened(true)}
            dateFormat={''}
            timeFormat={format === 'DateAndTime'}
            //@ts-ignore
            onChange={(value: moment.Moment) => {
                notifyOutputChanged({
                value: value.toDate()
            })}
        }
             
            value={formatValue()} />
    ) */
}