import type { Meta, StoryObj } from '@storybook/angular';
import { PollingProgessComponent } from './polling-progess.component';
import { EMPTY, of } from 'rxjs';
import { moduleMetadata } from '@storybook/angular';
import { ErrorService } from '../error.service';
import { SnackBarService } from '../snack-bar/snack-bar.service';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { DEFAULT_DATE_TIME_FORMAT } from '../constants';

const meta: Meta<PollingProgessComponent<void>> = {
  title: 'PollingProgess',
  component: PollingProgessComponent,
  tags: ['autodocs'],
  render: (args: PollingProgessComponent<void>) => ({
    props: args,
  }),
  decorators: [
    moduleMetadata({
      providers: [
        ErrorService,
        SnackBarService,
        {
          provide: DATE_PIPE_DEFAULT_OPTIONS,
          useValue: {
            dateFormat: DEFAULT_DATE_TIME_FORMAT,
          },
        },
      ],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<PollingProgessComponent<void>>;

export const PollEvery60Seconds: Story = {
  args: {
    observable: of(undefined),
    pollIntervalInSeconds: 60,
  },
};

export const NoLastUpdate: Story = {
  args: {
    observable: EMPTY,
    pollIntervalInSeconds: 60,
  },
};
