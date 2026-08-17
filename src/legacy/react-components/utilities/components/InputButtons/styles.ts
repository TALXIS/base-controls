import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@fluentui/react";

export const getSuffixStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            height: '100%',
            '.ms-CommandBar': {
                padding: 0,
                '.ms-CommandBar-primaryCommand': {
                    display: 'none'
                },
            },
            '.ms-CommandBar, .ms-Button--commandBar, >div, >div>div, >div>div>div': {
                height: '100%'
            },
            '.hover-only[data-clickcopy]:has([data-icon-name="Checkmark"])': {
                display: 'block'
            }
        }
    })
}