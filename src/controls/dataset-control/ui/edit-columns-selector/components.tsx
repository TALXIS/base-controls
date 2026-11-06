import { getDatasetControlUiEditColumnsSelectorStyles } from "./styles";

/** Props for one option of a picker. */
export interface IEditColumnsSelectorOptionProps<TOption> {
    /** The option itself. */
    option: TOption;
    /** What the option shows. */
    text: string;
}

/** The replaceable pieces of a column editor's selector. */
export interface IDatasetControlUiEditColumnsSelectorComponents<TOption> {
    /** Wraps the select itself, e.g. to draw something next to it. */
    onRenderSelector: (props: { children: React.ReactNode }) => JSX.Element | null;
    /** One option's content, e.g. with commands after its text. */
    onRenderOption: (props: IEditColumnsSelectorOptionProps<TOption>) => JSX.Element | null;
}

const styles = getDatasetControlUiEditColumnsSelectorStyles();

/** The defaults for {@link IDatasetControlUiEditColumnsSelectorComponents}. */
export const DatasetControlUiEditColumnsSelectorComponents: IDatasetControlUiEditColumnsSelectorComponents<any> = {
    onRenderSelector: props => <>{props.children}</>,
    onRenderOption: props => <span className={styles.optionText}>{props.text}</span>,
};
