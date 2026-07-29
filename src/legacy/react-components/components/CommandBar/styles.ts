import { mergeStyleSets } from "@fluentui/react";

export const getCommandBarStyles = () => {
  return mergeStyleSets({
    root: {
      '.ms-CommandBar': {
        paddingLeft: 0,
        paddingRight: 0,
        borderBottom: 0,
      },
      '.ms-Button-menuIcon[data-icon-name="ChevronDown"]': {
        transition: "transform 0.2s",
      },
      '.ms-Button-menuIcon.is-expanded[data-icon-name="ChevronDown"]': {
        transform: "rotate(180deg)",
      },
      '.ms-Button--commandBar .ms-Image': {
        width: 23,
        'img': {
          maxWidth: '100%'
        }
      },
      '.ms-Icon-imageContainer': {
        height: 'auto'
      }
    }
  });
}