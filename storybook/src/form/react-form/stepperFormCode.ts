export const stepperFormCode = `
const stepperTabs = [
  { id: "general", label: "General" },
  { id: "choices", label: "Choices" },
  { id: "metrics", label: "Metrics" },
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
  const orientation = "__STEPPER_ORIENTATION__";

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs
        expandedTab={activeTab}
        onTabChange={setActiveTab}
        components={{
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
        }}
      >
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Primary details" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Status" layout={{ lg: 1 }}>
              <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="choices" label="Choices">
          <Form.Column>
            <Form.Section label="Primary selections" layout={{ lg: 2 }}>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Multi-select fields" layout={{ lg: 1 }}>
              <Form.Field name="multiselectoptionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multiselectoptionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="metrics" label="Metrics">
          <Form.Column>
            <Form.Section label="Numeric review" layout={{ lg: 2 }}>
              <Form.Field name="currency"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="decimal"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="duration"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="number"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="schedule" label="Schedule">
          <Form.Column>
            <Form.Section label="Timing" layout={{ lg: 2 }}>
              <Form.Field name="dateonly"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="datetime"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="References" layout={{ lg: 1 }} cellLabelPosition="Top">
              <FluentText variant="small">
                The Stepper replaces the tabs header only; the underlying form tabs remain the same.
              </FluentText>
              <Form.Cell label="Office map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="OpenStreetMap embedded directly inside a stepped form flow."
                />
              </Form.Cell>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};
`.trim()
