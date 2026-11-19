import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const CARD_CODE = `//the header's box swapped for a ThemeProvider, so everything in it takes a theme of its own
const TintedHeader = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const tinted = useThemeBuilder({ theme: useTheme() }, { tint: { hue: '#2f9b70', strength: 'solid' } })
    return <ThemeProvider {...props} theme={tinted} />
}

//a Card is put together from the pieces it needs
const GridExample = () => {
    const [isSaved, setIsSaved] = React.useState(false)

    return <Stack tokens={{ childrenGap: 16 }} styles={{ root: { maxWidth: 640 } }}>
        <Card>
            <Card.Header>
                <Card.Header.Start>
                    <Icon iconName='CityNext' />
                    <Card.Title>Header, body and footer</Card.Title>
                </Card.Header.Start>
                <Card.Header.End>
                    <IconButton iconProps={{ iconName: 'Edit' }} />
                    <IconButton iconProps={{ iconName: 'More' }} />
                </Card.Header.End>
            </Card.Header>
            <Card.Body>
                <Text>Contoso Ltd. makes office furniture and sells it through regional dealers.</Text>
            </Card.Body>
            <Card.Footer>
                <Card.Footer.Start>
                    <Text variant='small'>{isSaved ? 'Saved' : 'Not saved yet'}</Text>
                </Card.Footer.Start>
                <Card.Footer.End>
                    <DefaultButton text='Cancel' />
                    <PrimaryButton text='Save' onClick={() => setIsSaved(true)} />
                </Card.Footer.End>
            </Card.Footer>
        </Card>

        <Card>
            <Card.Header>
                <Card.Header.Start>
                    <Card.Title>Header and body, start only</Card.Title>
                </Card.Header.Start>
            </Card.Header>
            <Card.Body>
                <Text>No footer: only the pieces given are drawn.</Text>
            </Card.Body>
        </Card>

        <Stack horizontal tokens={{ childrenGap: 16 }}>
            <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}><Card>
                <Card.Header>
                    <Card.Header.Start>
                        <Card.Title>A long title that wraps onto the next line by default</Card.Title>
                    </Card.Header.Start>
                    <Card.Header.End>
                        <IconButton iconProps={{ iconName: 'More' }} />
                    </Card.Header.End>
                </Card.Header>
                <Card.Body><Text>Wraps</Text></Card.Body>
            </Card></Stack.Item>
            <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}><Card>
                <Card.Header>
                    <Card.Header.Start>
                        <Card.Title nowrap>A long title that stays on one line with nowrap</Card.Title>
                    </Card.Header.Start>
                    <Card.Header.End>
                        <IconButton iconProps={{ iconName: 'More' }} />
                    </Card.Header.End>
                </Card.Header>
                <Card.Body><Text>nowrap</Text></Card.Body>
            </Card></Stack.Item>
        </Stack>

        <Card>
            <Card.Body>
                <Text>Body and a footer with its end only, which stays at the end.</Text>
            </Card.Body>
            <Card.Footer>
                <Card.Footer.End>
                    <PrimaryButton text='Done' />
                </Card.Footer.End>
            </Card.Footer>
        </Card>

        <Card components={{ onRender: props => <div {...props} style={{ borderLeft: '4px solid #0078d4' }} /> }}>
            <Card.Header>
                <Card.Header.Start>
                    <Card.Title components={{ onRender: props => <span {...props}>★ Replaced through a slot</span> }} />
                </Card.Header.Start>
            </Card.Header>
            <Card.Body>
                <Text>Every piece draws through its onRender slot.</Text>
            </Card.Body>
        </Card>

        <Card>
            <Card.Header components={{ onRender: props => <TintedHeader {...props} /> }}>
                <Card.Header.Start>
                    <Icon iconName='Color' />
                    <Card.Title>Header in its own theme</Card.Title>
                </Card.Header.Start>
                <Card.Header.End>
                    <IconButton iconProps={{ iconName: 'More' }} />
                </Card.Header.End>
            </Card.Header>
            <Card.Body>
                <Text>The header's onRender slot draws a ThemeProvider, so the title, icon and button take the tinted theme.</Text>
            </Card.Body>
        </Card>
    </Stack>
}
`

/** The Card's pieces composed in a few ways. */
export const CardPlayground = () => <GridExampleRunner seedCode={CARD_CODE} tabs={['preview', 'code']} />
