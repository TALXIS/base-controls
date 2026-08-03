import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Empty = () => null;

const meta = {
  title: 'Form/Xrm/Form Context',
  component: Empty,
  parameters: {
    docs: {
      page: () => (
        <>
          <h1>Form Context</h1>
          <p>Work with an Xrm-compatible formContext that follows the Microsoft mental model while running on top of the Form runtime.</p>
          <div className="form-docs-copy">
            <p>
              <code>XrmForm</code> exposes a public <code>formContext</code> so the form can be manipulated in the same style as a model-driven app form. This is the runtime surface to use when the layout has already been defined and the goal is to interact with tabs, controls, notifications, save handlers, and field events.
            </p>
            <p>
              The implementation is intentionally aligned with the Microsoft form context model. That means developers who already know the model-driven app client API should be able to approach this surface with familiar expectations around <code>formContext.data</code>, <code>formContext.ui</code>, <code>getAttribute</code>, <code>getControl</code>, and save event handling.
            </p>
            <h2>What this section is for</h2>
            <p>
              Use the Form Context section when the interesting part is not building the layout or replacing the UI, but driving the live runtime behavior of the form after it is loaded.
            </p>
            <p>
              That includes scenarios such as reacting to field changes, applying validation rules, showing or clearing notifications, changing visibility, listening to tab events, and preventing save through the save event arguments.
            </p>
            <h2>Microsoft-compatible mental model</h2>
            <p>
              The goal is not to invent a new runtime vocabulary. Instead, the exposed <code>formContext</code> follows the Microsoft implementation closely enough that the same conceptual model carries over into these demos and consumer code.
            </p>
            <p>
              The main difference is that this runtime sits on top of the shared Form infrastructure, so the record lifecycle, strategy contract, and React integration still come from the base Form package.
            </p>
            <p>
              For the original Microsoft reference model, see the official <a href="https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context" target="_blank" rel="noreferrer">formContext Client API documentation</a>.
            </p>
            <h2>Demo</h2>
            <p>
              Use the focused stories under <a href="./?path=/story/form-xrm-form-context-demos--qualification-review">Form / Xrm / Form Context / Demos</a> to explore subscriptions, runtime mutations, save handling, and the preset scenarios that exercise the exposed <code>formContext</code> API.
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
