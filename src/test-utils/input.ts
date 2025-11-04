import { ComponentRef } from '@angular/core';

export type InputData = [string, unknown];

export function setInputs<T>(
  componentRef: ComponentRef<T>,
  inputs: InputData[],
) {
  for (const [name, value] of inputs) {
    componentRef.setInput(name, value);
  }
}
