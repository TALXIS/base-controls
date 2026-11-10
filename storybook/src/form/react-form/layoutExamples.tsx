import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withRecord } from './shared'

const RESPONSIVE_CODE = `import { account } from './record'

const GridExample = () => {
    const [tab, setTab] = React.useState('summary')
    const [width, setWidth] = React.useState(1100)
    const [columnsPerRow, setColumnsPerRow] = React.useState(0)

    return <>
        <Slider label='Width of the form' min={320} max={1100} step={10} value={width} onChange={setWidth} valueFormat={value => \`\${value}px\`} />
        <Text>{\`Columns in a row: \${columnsPerRow}\`}</Text>
        <div style={{ width, maxWidth: '100%' }}>
            <Form.Root onLoad={async () => ({ record: account })}>
                <Form.Tabs expandedTab={tab} onTabChange={setTab}>
                    {/* md, sm and xs fall back to min(lg, 3), min(lg, 2) and 1 */}
                    <Form.Tab id='summary' label='Summary' layout={{ lg: 3 }} onColumnsPerRowChanged={setColumnsPerRow}>
                        <Form.Column>
                            {/* one cell in a row at any width */}
                            <Form.Section label='Contact' layout={{ lg: 1 }}>
                                <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                                <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            </Form.Section>
                        </Form.Column>
                        <Form.Column>
                            <Form.Section label='Company'>
                                <Form.Field name='industrycode'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            </Form.Section>
                        </Form.Column>
                        <Form.Column>
                            <Form.Section label='Terms'>
                                <Form.Field name='creditlimit'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            </Form.Section>
                        </Form.Column>
                        {/* as wide as the columns the tab draws */}
                        <Form.Column colspan={3}>
                            {/* labels above the controls */}
                            <Form.Section label='Notes' layout={{ lg: 3 }} cellLabelPosition='Top'>
                                <Form.Field name='websiteurl'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                                <Form.Field name='description'><Form.Cell colspan={2}><Form.Control /></Form.Cell></Form.Field>
                            </Form.Section>
                        </Form.Column>
                    </Form.Tab>
                    <Form.Tab id='rating' label='Rating'>
                        <Form.Column>
                            {/* without a layout, lg is the number of cells */}
                            <Form.Section label='Rating'>
                                <Form.Field name='rating'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                                <Form.Field name='active'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            </Form.Section>
                        </Form.Column>
                    </Form.Tab>
                </Form.Tabs>
            </Form.Root>
        </div>
    </>
}
`

export const ResponsiveExample = () => <GridExampleRunner seedCode={withRecord(RESPONSIVE_CODE, ['name', 'telephone1', 'industrycode', 'creditlimit', 'websiteurl', 'description', 'rating', 'active'])} tabs={['preview', 'code']} />
