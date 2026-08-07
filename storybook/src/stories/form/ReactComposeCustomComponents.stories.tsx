import React, { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form } from '@talxis/base-controls/components/Form'
import type { IFormApi } from '@talxis/base-controls/components/Form'
import { ExampleRunner, renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { getMemoryStrategy } from '../../form/shared/formModel'
import { ReactComposeLivePreview } from './ReactComposeLivePreview'

interface ICustomComponentsExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
    previewCode?: string
}

const sharedStrategyCode = `const strategy = new MemoryStrategy({
  onGetData: () => recordData,
  onGetColumns: () => modelColumns,
  onGetMetadata: () => ({
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "text",
  }),
});
`

const customComponentsExamples: ICustomComponentsExample[] = [
    {
        id: 'custom-tabs',
        title: 'Replace the tabs renderer',
        summary: 'Use `Form.Tabs components.onRenderTabs` to swap the default tab header with a custom presentation component.',
        notes: [
            'This is useful when navigation should look like a stepper, wizard, sidebar, or another domain-specific shell.',
            'The underlying tabs state and tab content stay the same; you replace the presentation layer only.',
        ],
        previewCode: `${sharedStrategyCode}
const stepperTabs = [
  { id: "general", label: "General" },
  { id: "details", label: "Details" },
  { id: "schedule", label: "Schedule" },
];

const getStepIndex = (tabId) => Math.max(stepperTabs.findIndex((tab) => tab.id === tabId), 0);

function StepperTabs(props) {
  const { children, expandedTab, onTabChange, orientation } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeStepIndex = getStepIndex(expandedTab);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <MuiStepper nonLinear orientation={orientation} activeStep={activeStepIndex}>
        {tabs.map((tab) => {
          const isActive = tab.props.id === expandedTab;

          return (
            <MuiStep key={tab.props.id} expanded={orientation === "vertical" ? isActive : undefined}>
              <MuiStepButton color="inherit" onClick={() => onTabChange(tab.props.id)}>
                {tab.props.label || tab.props.id}
              </MuiStepButton>
              {orientation === "vertical" ? <MuiStepContent>{tab}</MuiStepContent> : null}
            </MuiStep>
          );
        })}
      </MuiStepper>
      {orientation === "horizontal" ? activeTab : null}
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [orientation, setOrientation] = React.useState("horizontal");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <FluentText>Tabs orientation</FluentText>
        <ComboBox
          selectedKey={orientation}
          options={[
            { key: "horizontal", text: "Horizontal" },
            { key: "vertical", text: "Vertical" },
          ]}
          onChange={(_event, option) => {
            if (option?.key) {
              setOrientation(String(option.key));
            }
          }}
        />
      </Stack>
      <Form.Tabs
        expandedTab={activeTab}
        onTabChange={setActiveTab}
        components={{
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
        }}
      >
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="details" label="Details">
          <Form.Column>
            <Form.Section label="Status" layout={{ lg: 2 }}>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="schedule" label="Schedule">
          <Form.Column>
            <Form.Section label="Dates" layout={{ lg: 2 }}>
              <Form.Field name="dateonly"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="datetime"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
const stepperTabs = [
  { id: "general", label: "General" },
  { id: "details", label: "Details" },
  { id: "schedule", label: "Schedule" },
];

const getStepIndex = (tabId) => Math.max(stepperTabs.findIndex((tab) => tab.id === tabId), 0);

function StepperTabs(props) {
  const { children, expandedTab, onTabChange, orientation } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeStepIndex = getStepIndex(expandedTab);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <MuiStepper nonLinear orientation={orientation} activeStep={activeStepIndex}>
        {tabs.map((tab) => {
          const isActive = tab.props.id === expandedTab;

          return (
            <MuiStep key={tab.props.id} expanded={orientation === "vertical" ? isActive : undefined}>
              <MuiStepButton color="inherit" onClick={() => onTabChange(tab.props.id)}>
                {tab.props.label || tab.props.id}
              </MuiStepButton>
              {orientation === "vertical" ? <MuiStepContent>{tab}</MuiStepContent> : null}
            </MuiStep>
          );
        })}
      </MuiStepper>
      {orientation === "horizontal" ? activeTab : null}
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [orientation, setOrientation] = React.useState("horizontal");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <FluentText>Tabs orientation</FluentText>
        <ComboBox
          selectedKey={orientation}
          options={[
            { key: "horizontal", text: "Horizontal" },
            { key: "vertical", text: "Vertical" },
          ]}
          onChange={(_event, option) => {
            if (option?.key) {
              setOrientation(String(option.key));
            }
          }}
        />
      </Stack>
      <Form.Tabs
        expandedTab={activeTab}
        onTabChange={setActiveTab}
        components={{
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
        }}
      >
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="details" label="Details">
          <Form.Column>
            <Form.Section label="Status" layout={{ lg: 2 }}>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="schedule" label="Schedule">
          <Form.Column>
            <Form.Section label="Dates" layout={{ lg: 2 }}>
              <Form.Field name="dateonly"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="datetime"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-field-content',
        title: 'Compose custom field content',
        summary: 'Use `Form.Field`, `Form.Cell`, and hooks like `useField` when a field needs a custom React presentation instead of the stock control renderer.',
        notes: [
            'This is a good fit for read/write custom widgets that still participate in the form runtime.',
            'You can read and write the bound field value while keeping validation, save flow, and notifications integrated.',
        ],
        previewCode: `${sharedStrategyCode}
function RatingButtons() {
  const field = useField();
  const currentValue = Number(field?.getValue() ?? 0);

  return (
    <Stack horizontal tokens={{ childrenGap: 8 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <IconButton
          key={value}
          iconProps={{ iconName: value <= currentValue ? "FavoriteStarFill" : "FavoriteStar" }}
          title={\`Rate \${value}\`}
          onClick={() => field?.setValue(value === currentValue ? 0 : value)}
        />
      ))}
    </Stack>
  );
}

function RatingField() {
  const field = useField("number");
  const currentValue = Number(field?.getValue() ?? 0);
  const validation = {
    error: currentValue <= 0,
    errorMessage: "Select a priority rating before saving.",
  };

  return (
    <Form.Field name="number" validation={validation}>
      <Form.Cell label="Priority rating">
        <Form.Control components={{ onRenderControl: () => <RatingButtons /> }} />
      </Form.Cell>
    </Form.Field>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("custom");

  return (
    <Form.Root strategy={strategy} onFormReady={(api) => api.getField("number").setValue(0)}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="custom" label="Custom field content" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard runtime fields" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom projection" layout={{ lg: 1 }} cellLabelPosition="Top">
              <RatingField />
              <Form.Field name="currency">
                <Form.Cell label="Budget">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
function RatingButtons() {
  const field = useField();
  const currentValue = Number(field?.getValue() ?? 0);

  return (
    <Stack horizontal tokens={{ childrenGap: 8 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <IconButton
          key={value}
          iconProps={{ iconName: value <= currentValue ? "FavoriteStarFill" : "FavoriteStar" }}
          title={\`Rate \${value}\`}
          onClick={() => field?.setValue(value === currentValue ? 0 : value)}
        />
      ))}
    </Stack>
  );
}

function RatingField() {
  const field = useField("number");
  const currentValue = Number(field?.getValue() ?? 0);
  const validation = {
    error: currentValue <= 0,
    errorMessage: "Select a priority rating before saving.",
  };

  return (
    <Form.Field name="number" validation={validation}>
      <Form.Cell label="Priority rating">
        <Form.Control components={{ onRenderControl: () => <RatingButtons /> }} />
      </Form.Cell>
    </Form.Field>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("custom");

  return (
    <Form.Root strategy={strategy} onFormReady={(api) => api.getField("number").setValue(0)}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="custom" label="Custom field content" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard runtime fields" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom projection" layout={{ lg: 1 }} cellLabelPosition="Top">
              <RatingField />
              <Form.Field name="currency">
                <Form.Cell label="Budget">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-rich-cells',
        title: 'Mix runtime fields with custom content cells',
        summary: 'Custom components do not have to replace the whole form surface; they can be introduced selectively alongside standard fields.',
        notes: [
            'This is useful for summaries, helper panels, or domain-specific visualizations embedded in the form layout.',
            'Keeping the custom content compact usually reads better than mixing several large custom surfaces in one section.',
        ],
        previewCode: `${sharedStrategyCode}
function SummaryPanel() {
  const textField = useField("text");
  const phoneField = useField("phone");
  const stageField = useField("optionset");

  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          border: "1px solid #e1dfdd",
        },
      }}
    >
      <FluentText variant="mediumPlus">Record summary</FluentText>
      <FluentText>Name: {String(textField?.getValue() ?? "-")}</FluentText>
      <FluentText>Phone: {String(phoneField?.getValue() ?? "-")}</FluentText>
      <FluentText>Stage: {String(stageField?.getValue() ?? "-")}</FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Form inputs" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom workspace" layout={{ lg: 1 }} cellLabelPosition="Top">
              <Form.Cell label="Live summary">
                <SummaryPanel />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
function SummaryPanel() {
  const textField = useField("text");
  const phoneField = useField("phone");
  const stageField = useField("optionset");

  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          border: "1px solid #e1dfdd",
        },
      }}
    >
      <FluentText variant="mediumPlus">Record summary</FluentText>
      <FluentText>Name: {String(textField?.getValue() ?? "-")}</FluentText>
      <FluentText>Phone: {String(phoneField?.getValue() ?? "-")}</FluentText>
      <FluentText>Stage: {String(stageField?.getValue() ?? "-")}</FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Form inputs" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom workspace" layout={{ lg: 1 }} cellLabelPosition="Top">
              <Form.Cell label="Live summary">
                <SummaryPanel />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-sections-and-labels',
        title: 'Render cells through a custom section component',
        summary: 'When the default section look is not enough, you can render the fields directly through your own custom section component inside `Form.Root`.',
        notes: [
            'A custom section can render `Form.Field` and `Form.Cell` directly while taking full control over header and body presentation.',
            'This is useful when one area needs branded visuals or a distinct framing that the stock section chrome does not provide.',
        ],
        previewCode: `${sharedStrategyCode}
function CustomSection(props) {
  return (
    <Stack
      tokens={{ childrenGap: 12 }}
      styles={{
        root: {
          padding: 16,
          background: "#ffffff",
          borderLeft: "4px solid #0078d4",
        },
      }}
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Icon iconName="Design" />
        <FluentText variant="large">{props.title}</FluentText>
      </Stack>
      <FluentText styles={{ root: { color: "#605e5c" } }}>{props.subtitle}</FluentText>
      <Stack tokens={{ childrenGap: 10 }}>
        {props.children}
      </Stack>
    </Stack>
  );
}

function GuidancePanel() {
  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          background: "#ffffff",
        },
      }}
    >
      <FluentText variant="mediumPlus">Author guidance</FluentText>
      <FluentText>
        Any custom React can live inside Form.Root. That includes custom headings, grouped guidance, summaries, and bespoke layout wrappers.
      </FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard section" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell label="Name"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell label="Phone"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell label="Website"><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <CustomSection
                title="Custom-looking section"
                subtitle="This section is fully custom and renders the fields directly."
            >
              <Form.Cell label="Map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="A custom section component can render the fields and choose its own framing."
                />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <GuidancePanel />
            </CustomSection>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
function CustomSection(props) {
  return (
    <Stack
      tokens={{ childrenGap: 12 }}
      styles={{
        root: {
          padding: 16,
          background: "#ffffff",
          borderLeft: "4px solid #0078d4",
        },
      }}
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Icon iconName="Design" />
        <FluentText variant="large">{props.title}</FluentText>
      </Stack>
      <FluentText styles={{ root: { color: "#605e5c" } }}>{props.subtitle}</FluentText>
      <Stack tokens={{ childrenGap: 10 }}>
        {props.children}
      </Stack>
    </Stack>
  );
}

function GuidancePanel() {
  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          background: "#ffffff",
        },
      }}
    >
      <FluentText variant="mediumPlus">Author guidance</FluentText>
      <FluentText>
        Any custom React can live inside Form.Root. That includes custom headings, grouped guidance, summaries, and bespoke layout wrappers.
      </FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard section" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell label="Name"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell label="Phone"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell label="Website"><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <CustomSection
                title="Custom-looking section"
                subtitle="This section is fully custom and renders the fields directly."
            >
              <Form.Cell label="Map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="A custom section component can render the fields and choose its own framing."
                />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <GuidancePanel />
            </CustomSection>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-ribbon',
        title: 'Replace the ribbon renderer',
        summary: 'Use `Form.Ribbon components.onRenderCommandBar` to render a fully native Material UI toolbar, wiring Save directly through `useForm()`.',
        notes: [
            'Use this when the host application renders the rest of its UI in Material UI and wants a real MUI Button, not the runtime-supplied Fluent Save button.',
            '`useForm()` gives direct access to `save()` from inside the custom renderer; the runtime-supplied "save" item is ignored entirely.',
            'The "unsaved-changes" far item is still read from the runtime to drive the dirty-state chip, since that stays reactive for free.',
        ],
        previewCode: `${sharedStrategyCode}
function MaterialRibbon(props) {
  const { farItems = [] } = props;
  const form = useForm();
  const unsavedItem = farItems.find((item) => item.key === "unsaved-changes");

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderRadius: 2, mb: 2 }}>
      <Toolbar variant="dense" sx={{ justifyContent: "space-between", gap: 1 }}>
        <MuiButton variant="contained" size="small" onClick={() => form.save()}>
          Save
        </MuiButton>
        {unsavedItem && <Chip label={unsavedItem.text} color="warning" size="small" variant="outlined" />}
      </Toolbar>
    </AppBar>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon
        components={{
          onRenderCommandBar: (commandBarProps) => <MaterialRibbon {...commandBarProps} />,
        }}
      />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
function MaterialRibbon(props) {
  const { farItems = [] } = props;
  const form = useForm();
  const unsavedItem = farItems.find((item) => item.key === "unsaved-changes");

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderRadius: 2, mb: 2 }}>
      <Toolbar variant="dense" sx={{ justifyContent: "space-between", gap: 1 }}>
        <MuiButton variant="contained" size="small" onClick={() => form.save()}>
          Save
        </MuiButton>
        {unsavedItem && <Chip label={unsavedItem.text} color="warning" size="small" variant="outlined" />}
      </Toolbar>
    </AppBar>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon
        components={{
          onRenderCommandBar: (commandBarProps) => <MaterialRibbon {...commandBarProps} />,
        }}
      />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-notifications',
        title: 'Replace the notifications renderer',
        summary: 'Use `Form.Notifications components.onRenderNotifications` to render dismissable, self-clearing Material UI Snackbars instead of the stock notifications list.',
        notes: [
            'In React compose, notifications are just a controlled `messages` prop; there is no separate runtime API to call into.',
            'Each toast auto-hides after 6 seconds and can also be dismissed early via its close button.',
        ],
        previewCode: `${sharedStrategyCode}
function MaterialNotifications(props) {
  const { messages = [] } = props;
  const [dismissed, setDismissed] = React.useState({});

  const severityByLevel = {
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  };

  const dismiss = (key) => {
    setDismissed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <>
      {messages.map((message, index) => {
        const key = \`\${index}-\${message.text}\`;

        if (dismissed[key]) {
          return null;
        }

        return (
          <Snackbar
            key={key}
            open
            autoHideDuration={6000}
            onClose={(_event, reason) => reason !== "clickaway" && dismiss(key)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ bottom: \`\${16 + index * 64}px !important\` }}
          >
            <Alert
              severity={severityByLevel[message.level] ?? "info"}
              variant="filled"
              onClose={() => dismiss(key)}
              sx={{ width: "100%" }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [messages, setMessages] = React.useState([]);

  const addNotification = (level) => {
    setMessages((prev) => [...prev, { text: \`Custom \${level.toLowerCase()} notification\`, level }]);
  };

  return (
    <Form.Root strategy={strategy}>
      <Stack horizontal tokens={{ childrenGap: 8 }} styles={{ root: { marginBottom: 12 } }}>
        <MuiButton variant="contained" onClick={() => addNotification("INFO")}>Add info</MuiButton>
        <MuiButton variant="outlined" color="warning" onClick={() => addNotification("WARNING")}>Add warning</MuiButton>
        <MuiButton variant="outlined" color="error" onClick={() => addNotification("ERROR")}>Add error</MuiButton>
      </Stack>
      <Form.Notifications
        messages={messages}
        components={{
          onRenderNotifications: (notificationsProps) => <MaterialNotifications {...notificationsProps} />,
        }}
      />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
        code: `${sharedStrategyCode}
function MaterialNotifications(props) {
  const { messages = [] } = props;
  const [dismissed, setDismissed] = React.useState({});

  const severityByLevel = {
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  };

  const dismiss = (key) => {
    setDismissed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <>
      {messages.map((message, index) => {
        const key = \`\${index}-\${message.text}\`;

        if (dismissed[key]) {
          return null;
        }

        return (
          <Snackbar
            key={key}
            open
            autoHideDuration={6000}
            onClose={(_event, reason) => reason !== "clickaway" && dismiss(key)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ bottom: \`\${16 + index * 64}px !important\` }}
          >
            <Alert
              severity={severityByLevel[message.level] ?? "info"}
              variant="filled"
              onClose={() => dismiss(key)}
              sx={{ width: "100%" }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [messages, setMessages] = React.useState([]);

  const addNotification = (level) => {
    setMessages((prev) => [...prev, { text: \`Custom \${level.toLowerCase()} notification\`, level }]);
  };

  return (
    <Form.Root strategy={strategy}>
      <Stack horizontal tokens={{ childrenGap: 8 }} styles={{ root: { marginBottom: 12 } }}>
        <MuiButton variant="contained" onClick={() => addNotification("INFO")}>Add info</MuiButton>
        <MuiButton variant="outlined" color="warning" onClick={() => addNotification("WARNING")}>Add warning</MuiButton>
        <MuiButton variant="outlined" color="error" onClick={() => addNotification("ERROR")}>Add error</MuiButton>
      </Stack>
      <Form.Notifications
        messages={messages}
        components={{
          onRenderNotifications: (notificationsProps) => <MaterialNotifications {...notificationsProps} />,
        }}
      />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
]

const renderCustomComponentsExample = (example: ICustomComponentsExample) => {
    const [code, setCode] = useState(example.code)
    const [compileError, setCompileError] = useState<string | null>(null)
    const strategy = useMemo(() => getMemoryStrategy(), [])
    const formApiRef = useRef<IFormApi | null>(null)

    const formProps = useMemo(
        () => ({
            strategy,
            onFormReady: (api: IFormApi) => {
                formApiRef.current = api
            },
            onAfterSave: ({ success }: { success: boolean }) => {
                const currentData = formApiRef.current?.getData()
                console.log(success ? "Form saved" : "Save failed", { success, currentData })
            },
        } as React.ComponentProps<typeof Form.Root>),
        [strategy],
    )

    return (
        <ExampleRunner
            error={compileError}
            renderPreview={() => (
                <ReactComposeLivePreview
                    code={code}
                    codePreview={example.previewCode ?? example.code}
                    formProps={formProps}
                    onError={setCompileError}
                />
            )}
            renderCode={() => <FormCodeEditor value={code} onChange={setCode} />}
        />
    )
}

const meta = {
    title: 'Form/React compose/Custom Components',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
Replace parts of the React compose rendering with your own components while the runtime keeps handling state, validation, and save flow.

Custom components don't opt you out of the runtime — they let you own presentation for one area while everything else (binding, validation, notifications, dirty tracking, save) stays managed.

> Some stories below use Material UI purely to demonstrate that presentation is fully swappable, not because it's the recommended choice. To keep a form visually coherent, prefer sticking to Fluent UI where possible — that's what the rest of the runtime renders with.

## What you can replace

- **Presentation shells** — swap the tabs renderer for a stepper, wizard, sidebar, or other domain-specific navigation.
- **Field widgets** — compose custom read/write UI with \`Form.Field\`, \`Form.Cell\`, and \`useField\` that still participates in validation and save flow.
- **Embedded content** — mix runtime-managed controls with summaries, helper panels, maps, and other custom cells.
- **Section framing** — render fields through a custom section wrapper when one area needs presentation the stock section chrome doesn't provide.
- **Ribbon** — replace the command bar with a native toolbar while \`useForm()\` still drives save and dirty state.
- **Notifications** — replace the notifications list with a custom renderer over the same controlled \`messages\` prop.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const samplesById = Object.fromEntries(customComponentsExamples.map((sample) => [sample.id, sample])) as Record<string, ICustomComponentsExample>

export const ReplaceTabsRenderer: Story = {
    name: 'Replace the tabs renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-tabs'].previewCode ?? samplesById['custom-tabs'].code,
            },
            description: {
                story: `
Uses \`Form.Tabs components.onRenderTabs\` to swap the default tab header with a stepper-style presentation component.

- replaces only the tabs shell
- keeps the tab state and content on the same runtime
- supports horizontal and vertical orientations
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-tabs'])),
}

export const ComposeCustomFieldContent: Story = {
    name: 'Compose custom field content',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-field-content'].previewCode ?? samplesById['custom-field-content'].code,
            },
            description: {
                story: `
Shows how to build custom read/write field UI with \`Form.Field\`, \`Form.Cell\`, and \`useField\` while staying inside the form runtime.

- binds custom widgets to form-managed values
- keeps validation and save flow integrated
- mixes stock controls with custom field projections
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-field-content'])),
}

export const MixRuntimeFieldsWithCustomContentCells: Story = {
    name: 'Mix runtime fields with custom content cells',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-rich-cells'].previewCode ?? samplesById['custom-rich-cells'].code,
            },
            description: {
                story: `
Adds compact custom summary content alongside standard runtime-managed fields in the same authored layout.

- keeps standard controls where they already fit
- embeds helper or summary panels selectively
- uses custom content cells without replacing the whole form surface
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-rich-cells'])),
}

export const RenderCellsThroughCustomSectionComponent: Story = {
    name: 'Render cells through a custom section component',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-sections-and-labels'].previewCode ?? samplesById['custom-sections-and-labels'].code,
            },
            description: {
                story: `
Renders fields through a fully custom section wrapper when one area needs distinct framing beyond the stock section chrome.

- places custom React directly inside \`Form.Root\`
- renders \`Form.Field\` and \`Form.Cell\` through a custom wrapper
- combines branded framing with runtime-backed form fields
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-sections-and-labels'])),
}

export const ReplaceRibbonRenderer: Story = {
    name: 'Replace the ribbon renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-ribbon'].previewCode ?? samplesById['custom-ribbon'].code,
            },
            description: {
                story: `
Renders a native Material UI toolbar through \`Form.Ribbon components.onRenderCommandBar\`, wiring Save directly through \`useForm()\`.

- swaps the ribbon presentation layer for real MUI components (AppBar, Toolbar, Button, Chip)
- ignores the runtime's \`commandBarButtonAs\` renderer entirely; Save is a plain MUI \`Button\` calling \`useForm().save()\`
- still reads the "unsaved-changes" far item to drive a dirty-state \`Chip\`
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-ribbon'])),
}

export const ReplaceNotificationsRenderer: Story = {
    name: 'Replace the notifications renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: samplesById['custom-notifications'].previewCode ?? samplesById['custom-notifications'].code,
            },
            description: {
                story: `
Renders dismissable, self-clearing Material UI \`Snackbar\`/\`Alert\` toasts through \`Form.Notifications components.onRenderNotifications\`.

- swaps the notifications presentation layer for real MUI components (\`Snackbar\`, \`Alert\`)
- notifications are a plain controlled \`messages\` prop; there is no separate runtime API to call
- each toast auto-hides after 6 seconds or can be dismissed early via its close button
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById['custom-notifications'])),
}
