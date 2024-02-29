import type { Meta, StoryObj } from '@storybook/angular';
import { StatusWithTextComponent } from './status-with-text.component';
import { StatusWithTextStatus } from '../core/status-with-text';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<StatusWithTextComponent> = {
  title: 'StatusWithText',
  component: StatusWithTextComponent,
  tags: ['autodocs'],
  render: (args: StatusWithTextComponent) => ({
    props: args,
  }),
  argTypes: {
    status: {
      control: { type: 'select' },
      options: StatusWithTextStatus,
    },
  },
};

export default meta;
type Story = StoryObj<StatusWithTextComponent>;

export const StatusSuccess: Story = {
  args: {
    text: 'CI',
    status: StatusWithTextStatus.SUCCESS,
    link: '',
  },
};

export const StatusFailed: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusWithTextStatus.FAILED,
  },
};

export const StatusInProgress: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusWithTextStatus.PENDING,
  },
};
