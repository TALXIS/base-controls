import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Empty = () => null;

const meta = {
  title: 'Form/Xrm/Overview',
  component: Empty,
  parameters: {
    docs: {
      page: () => (
        <>
          <h1>Xrm and FormXml</h1>
          <p>Use XrmForm when the form structure comes from FormXml and you need Xrm-aware runtime behavior.</p>
          <div className="form-docs-copy">
            <p>
              <code>XrmForm</code> builds on top of the base Form runtime and adds two important things: a FormXml-driven layout model and a public <code>formContext</code> that is intentionally compatible with the way model-driven app developers expect to work.
            </p>
            <p>
              This means you can keep the same record lifecycle and field binding model as the base Form runtime while still treating the rendered form like an Xrm form with tabs, sections, controls, visibility changes, and runtime mutations.
            </p>
            <h2>What XrmForm adds</h2>
            <p>
              The base Form runtime already knows how to load data, bind fields, validate, and save. <code>XrmForm</code> adds the Xrm-specific layer on top of that.
            </p>
            <p>
              Instead of declaring the layout in JSX, the layout is read from FormXml. Instead of only thinking in terms of React component state, you can also work with the exposed <code>IXrmFormContext</code> and manipulate the form in the same style as a model-driven app form.
            </p>
            <p>
              That gives the package a way to support model-driven scenarios without forking into a completely separate form system. The data and runtime lifecycle stay aligned with the base Form package, but the authoring and interaction model can feel native to Xrm-oriented development.
            </p>
            <h2>How to navigate the Xrm section</h2>
            <p>
              The Xrm section is split by the kind of work you are doing. Start with the preview stories when you want to understand the base rendering model of <code>XrmForm</code> itself.
            </p>
            <p>
              Move to the Builder category when you want to shape the layout and supporting inputs directly. That section keeps the FormXml, record data, and model surfaces separate so each concern can be edited clearly, while the Form Xml and Model stories each let you switch between their graphical settings views and raw Monaco editors.
            </p>
            <p>
              Move to Custom UI when the stock Xrm rendering is no longer enough and the goal is to replace controls or tabs while keeping the same underlying form runtime.
            </p>
            <p>
              Move to Form Context when the layout is already in place and the main goal is to manipulate the runtime in a Microsoft-style way through the exposed <code>formContext</code> API.
            </p>
            <h2>Custom UI and runtime manipulation</h2>
            <p>There are two main extension directions shown in the demos.</p>
            <p>
              The first is top-level UI override. You can replace selected controls or replace the tab navigation UI while still keeping the same form model and underlying field bindings.
            </p>
            <p>
              The second is runtime behavior through <code>formContext</code>. That is where visibility, notifications, tab state, and event-driven interactions become important.
            </p>
            <p>
              The dedicated <a href="./?path=/docs/form-xrm-custom-ui--docs">Form / Xrm / Custom UI</a> page goes deeper into the override patterns and points to the focused stories for custom controls and custom tabs.
            </p>
            <p>
              The dedicated <a href="./?path=/docs/form-xrm-form-context--docs">Form / Xrm / Form Context</a> page explains the Xrm-compatible runtime surface and points to the live form context demos.
            </p>
            <h2>Interactive demos</h2>
            <p>
              Use <a href="./?path=/story/form-xrm-builder--preview">Form / Xrm / Builder / Preview</a> when you want to preview the form being built. That preview now also includes a FormXml toggle so you can inspect or edit the current XML in Monaco without leaving the preview surface. Use the sibling Form Xml, Data, and Model stories to edit the layout inputs directly. The Form Xml story opens in graphical settings mode by default and includes a toggle to switch to the Monaco editor. The Model story follows the same pattern for guided model editing and raw JSON editing.
            </p>
            <p>Use the focused custom control and custom tabs stories under <a href="./?path=/docs/form-xrm-custom-ui--docs">Form / Xrm / Custom UI</a> when you want to look specifically at top-level UI overrides.</p>
            <p>
              Use the focused stories under <a href="./?path=/story/form-xrm-form-context-demos--qualification-review">Form / Xrm / Form Context / Demos</a> when you want to explore runtime interactions through the exposed form context API. The workflow stories keep the live form preview on the left and scenario controls plus code on the right, while the console is split into its own story.
            </p>
          </div>
        </>
      ),
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  render: Empty,
};
