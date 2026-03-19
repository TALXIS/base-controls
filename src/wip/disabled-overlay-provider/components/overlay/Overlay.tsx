import { useMemo } from 'react'
import { Overlay as OverlayBase } from "../../../overlay-provider/components"
import { getClassNames } from '../../../../utils'
import { getOverlayStyles } from './styles'
import { IOverlayProps } from '@fluentui/react'

export const Overlay = (props: IOverlayProps) => {
    const styles = useMemo(() => getOverlayStyles(), []);
    
    return <OverlayBase {...props} className={getClassNames([styles.overlay, props.className])} />
}