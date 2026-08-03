import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { defaultFormCode } from '../../form/react-form/defaultFormCode';
import { stepperFormCode } from '../../form/react-form/stepperFormCode';

const preStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  padding: 16,
  borderRadius: 8,
  overflowX: 'auto',
  background: '#0f172a',
  color: '#e2e8f0',
};

const meta = {
  title: 'Form/React compose/Overview',
  parameters: {
    docs: {
      page: () => (
        <>
          <h1>React compose</h1>
          <p>Compose forms directly from the Form API and start with a small, readable layout before adding advanced customization.</p>
          <div className="form-docs-copy">
            <p>The React compose model is the default way to work with the Form runtime.</p>
            <p>
              You start with <code>Form.Root</code>, provide a strategy that knows how to load and save the record, and then describe the layout with tabs, sections, fields, cells, and controls. The important point is that the form behavior stays in the runtime while the layout stays in React, which makes the form easy to reason about and easy to refactor.
            </p>
            <h2>The default composition model</h2>
            <p>
              In the standard setup, <code>Form.Root</code> owns the runtime. It loads the record, binds fields to the data, tracks dirty state, validates before save, and exposes events and an imperative API for orchestration.
            </p>
            <p>
              The layout itself is built from the composed <code>Form</code> object. Tabs define high-level navigation, sections define structure, and field-level components bind UI to named values in the record. Because the layout is just React, the form stays approachable even when it becomes large.
            </p>
            <p>
              This is also the authoring model that best reflects the main public API of the package. Consumers import <code>Form</code>, compose the layout from that object, and only reach for deeper customization when the standard rendering is not enough.
            </p>
            <h2>How to navigate the React compose section</h2>
            <p>
              The React compose section is split by the kind of work you are doing. Start with the preview stories when you want to understand the base composition model and the rendered result.
            </p>
            <p>
              Move to the Builder category when you want to inspect and edit the supporting inputs for that form, such as record data, model definition, and source code.
            </p>
            <p>
              Move to Custom UI when the standard rendering is no longer enough and the goal is to replace the presentation of a selected surface, such as tabs navigation, while keeping the same underlying form runtime.
            </p>
            <h2>Default composition example</h2>
            <p>
              This is the kind of example a new consumer should see first: a small strategy, a single tab, a single section, and a couple of bound fields. It shows the main shape of the API without mixing in override patterns or sandbox-specific behavior.
            </p>
            <pre style={preStyle}>{defaultFormCode}</pre>
            <h2>Extending the presentation later</h2>
            <p>
              Once the base composition model is clear, the same runtime can support presentation overrides. The important point is that those overrides are optional. They are not required to start using the form package well.
            </p>
            <p>
              When a product needs a different navigation experience, extension points such as <code>components.onRenderTabs</code> let you replace only the visual layer while keeping the same form model underneath.
            </p>
            <h2>Stepper tabs override example</h2>
            <p>
              Sometimes the layout should remain the same, but the navigation UI should be replaced. That is what <code>components.onRenderTabs</code> is for.
            </p>
            <p>
              In this example, the underlying tabs still belong to the form. Only the tab header is replaced with a Material UI Stepper. This keeps the form model stable while allowing a different presentation.
            </p>
            <pre style={preStyle}>{stepperFormCode}</pre>
            <h2>Interactive demos</h2>
            <p>
              Use <a href="./?path=/story/form-react-compose-builder--preview">Form / React compose / Builder / Preview</a> when you want to preview the form being edited, with the live code editor available directly beside the preview. Use the sibling Data and Model stories to work with the other supporting inputs. The Model story opens in guided mode by default and includes a toggle to switch to the Monaco JSON editor.
            </p>
            <p>
              Use <a href="./?path=/story/form-react-compose-custom-ui--stepper-tabs">Form / React compose / Custom UI</a> when you want to explore tabs overrides and other presentation-layer customizations.
            </p>
          </div>
        </>
      ),
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
