import React from 'react'
import Editor from '@monaco-editor/react'
import { Pivot, PivotItem } from '@fluentui/react'
import hostSource from './PublishedPcfForm.tsx?raw'

interface IPcfSourceProps { sample: string; xml: string }

export const PcfSource = ({ sample, xml }: IPcfSourceProps) => <Pivot>
    {[
        { name: 'Sample', language: 'typescript', value: sample },
        { name: 'Form XML', language: 'xml', value: xml },
        { name: 'Story host', language: 'typescript', value: hostSource },
    ].map(source => <PivotItem headerText={source.name} key={source.name}>
        <Editor height="640px" language={source.language} value={source.value}
            options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }} />
    </PivotItem>)}
</Pivot>
