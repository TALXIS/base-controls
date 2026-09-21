//the ready-made header first, the parts it is built from below
export * from './components';
export type { IGridColumnHeaderOptions, IGridColumnHeaderProps } from './ColumnHeader';
export * from './root';
export * from './theme';
export * from './container';
export * from './prefix';
export * from './content';
export * from './label';
export * from './menu';
export * from './required-marker';
export * from './suffix';
//named rather than spread: a part and the component it is drawn by share a name
export { ColumnHeaderUi } from './ui';
export type {
    IColumnHeaderUi, IColumnHeaderContainerProps, IColumnHeaderContentProps, IColumnHeaderLabelProps,
    IColumnHeaderRequiredMarkerProps, IColumnHeaderPrefixProps, IColumnHeaderSuffixProps,
    IColumnHeaderSuffixComponents, IColumnHeaderMenuProps
} from './ui';
