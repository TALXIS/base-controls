import { ITheme, mergeStyles } from "@fluentui/style-utilities"

export const getDatePickerStyles = (theme: ITheme, classId: string) => {
    return mergeStyles({
        displayName: classId,
        '.is-open .ms-TextField--borderless': {
            transform: "translateX(0px)",
        },
        '& [class^="TALXIS__textfield__root"] .ms-TextField.is-active .ms-TextField-fieldGroup::after, .is-open .ms-TextField .ms-TextField-fieldGroup::after': {
            border: `2px solid ${theme.palette.themePrimary}`,
            opacity: 1,
            transition: 'none'
        },
        '.is-open .hover-only': {
            display: 'block'
        }
    });
}