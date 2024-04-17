
import { IOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';

export const OptionSet = (props: IOptionSet) => {
    const [onNotifyOutputChanged] = useComponent('OptionSet', props);

    return <ComboBox options={[]} />;
};