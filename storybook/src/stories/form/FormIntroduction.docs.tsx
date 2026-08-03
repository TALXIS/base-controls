import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta = {
  title: 'Form/Concepts/Introduction',
  parameters: {
    docs: {
      page: () => (
        <>
          <h1>Form</h1>
          <p>Build record-driven forms with a shared runtime, composable React APIs, and Xrm / FormXml support when you need it.</p>
          <div className="form-docs-copy">
            <p>
              Form is a complete runtime for building record-driven experiences, not just a set of input controls. It brings together data loading, field binding, validation, dirty tracking, save orchestration, and layout primitives so a form behaves like a single system instead of a loose collection of components.
            </p>
            <p>
              That makes it a good fit when a product needs forms that are structured, extensible, and consistent across different presentation models. The same foundation can power a React-authored form, a heavily customized UI, or an Xrm-style surface driven by FormXml.
            </p>
            <h2>What Form gives you</h2>
            <p>
              At the center is a shared record runtime. A strategy loads and saves data, fields bind to that record, validation flows through the same lifecycle, and the form keeps track of runtime state such as dirtiness and readiness.
            </p>
            <p>
              On top of that runtime, the package gives you a layout model based on tabs, sections, cells, fields, and controls. Those building blocks are meant to keep the form structure explicit while still leaving room for consumer overrides where the product experience needs a different presentation.
            </p>
            <p>
              The selling point is that the behavior stays stable even when the UI changes. A team can start with the standard composition model and later replace specific parts of the presentation without rebuilding the entire form stack.
            </p>
            <h2>Two ways to build on the same runtime</h2>
            <p>Form supports two main authoring models.</p>
            <p>
              The first is the compose-first React API built around the exported <code>Form</code> object. That is the main entry point when you want to define the layout directly in React and keep the structure close to the component tree.
            </p>
            <p>
              The second is <code>XrmForm</code>, which builds on the same runtime but renders a layout from FormXml and exposes a Microsoft-style <code>formContext</code>. That is the right choice when the form should behave like a model-driven app form and still be manipulated through familiar Xrm concepts.
            </p>
            <h2>How the runtime stays consistent</h2>
            <p>
              At the center of both models is the same record runtime: data is loaded through a strategy, fields bind to that record, validation and dirty state are tracked by the runtime, and save behavior flows through the same lifecycle.
            </p>
            <p>
              In the React compose model, the layout is declared directly with components such as <code>Form.Root</code>, <code>Form.Tabs</code>, <code>Form.Tab</code>, <code>Form.Section</code>, <code>Form.Field</code>, <code>Form.Cell</code>, and <code>Form.Control</code>.
            </p>
            <p>
              In the Xrm model, the layout comes from FormXml and the runtime exposes a public <code>IXrmFormContext</code> that behaves much closer to what developers expect from model-driven forms.
            </p>
            <h2>Where to start</h2>
            <p>
              Start with <a href="./?path=/docs/form-react-compose-overview--docs">Form / React compose / Overview</a> if you are building forms directly in React and want to understand the main composition model around <code>Form.Root</code>.
            </p>
            <p>
              Go to <a href="./?path=/docs/form-xrm-overview--docs">Form / Xrm / Overview</a> when the layout comes from FormXml or the runtime should feel like an Xrm form. Then use the demo sections to explore focused scenarios such as custom UI, tabs overrides, and form context interactions.
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
