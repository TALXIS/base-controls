import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Empty = () => null;

const meta = {
  title: 'Form/React compose/Custom UI',
  component: Empty,
  parameters: {
    docs: {
      page: () => (
        <>
          <h1>Custom UI</h1>
          <p>Replace selected presentation layers in the React compose model without changing the underlying form runtime.</p>
          <div className="form-docs-copy">
            <p>
              The React compose model starts with the standard <code>Form</code> object and its default rendering, but it also allows the presentation layer to be replaced when the product needs a different experience.
            </p>
            <p>
              In this section, the important point is that the form runtime remains the same. The tabs, field binding, validation, and save flow still belong to the form model. Only the visual rendering of a selected part of the UI is replaced.
            </p>
            <p>
              In practice, that does not stop at tabs. In React compose mode, a consumer can replace any part of the rendered surface with their own React components, including controls and other higher-level pieces, as long as those components still participate in the form runtime correctly.
            </p>
            <h2>Using your own components with form hooks</h2>
            <p>
              When you replace a piece of UI with your own component, that component can still communicate with the form through the same hooks that the built-in components use. The most important example is <code>useField</code>, which gives a custom control access to the current field value and lets it update that value through the form runtime.
            </p>
            <p>
              That means a custom component does not need to reimplement binding, validation flow, or save behavior on its own. It can render whatever UI it needs while still reading from and writing back to the same field model that the rest of the form uses.
            </p>
            <h2>Tabs overrides</h2>
            <p>
              Use <code>components.onRenderTabs</code> when the form tabs should be presented differently but the underlying tab structure should remain intact.
            </p>
            <p>
              That is the same idea as the Xrm tabs override: the form still owns which tabs exist and which one is selected, but the navigation UI can be swapped for something that fits the product experience better.
            </p>
            <p>
              The same general idea applies to custom controls and other custom components: replace the rendered component, keep the same form runtime underneath, and use hooks such as <code>useField</code> to stay connected to the live form state.
            </p>
            <h2>Custom tabs</h2>
            <p>
              Use <a href="./?path=/story/form-react-compose-custom-ui--stepper-tabs">Form / React compose / Custom UI / Custom Tabs</a> for the horizontal tabs override and <a href="./?path=/story/form-react-compose-custom-ui--stepper-tabs-vertical">Custom Tabs Vertical</a> for the same pattern with a vertical navigation layout.
            </p>
            <h2>When to use this section</h2>
            <p>
              Choose this approach when the standard React compose rendering is close, but not quite the final experience you need. It lets you keep the same form model, the same data binding, and the same runtime, while selectively replacing the presentation layer.
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
