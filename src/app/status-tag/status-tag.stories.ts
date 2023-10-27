import type { Meta, StoryObj } from '@storybook/angular';
import { StatusTagComponent } from './status-tag.component';
import { StatusTagColor } from './status-tag-color';
import { StatusTagStatus } from './status-tag-status';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<StatusTagComponent> = {
  title: 'StatusTag',
  component: StatusTagComponent,
  tags: ['autodocs'],
  render: (args: StatusTagComponent) => ({
    props: args,
  }),
  argTypes: {
    color: {
      control: { type: 'select' },
      options: StatusTagColor,
    },
    status: {
      control: { type: 'select' },
      options: StatusTagStatus,
    },
  },
};

export default meta;
type Story = StoryObj<StatusTagComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const StatusSuccess: Story = {
  args: {
    name: 'CI Build',
    color: StatusTagColor.GREEN,
    status: StatusTagStatus.SUCCESS,
    link: '',
  },
};

export const StatusError: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusTagStatus.ERROR,
  },
};

export const StatusInProgress: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusTagStatus.IN_PROGRESS,
  },
};

export const StatusWaiting: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusTagStatus.WAITING,
  },
};

export const StatusSkipped: Story = {
  args: {
    ...StatusSuccess.args,
    status: StatusTagStatus.SKIPPED,
  },
};

export const WithoutStatus: Story = {
  args: {
    ...StatusSuccess.args,
    name: 'live',
    status: StatusTagStatus.NONE,
  },
};

export const WithLink: Story = {
  args: {
    ...StatusSuccess.args,
    name: 'live',
    link: 'https://example.com',
  },
};
