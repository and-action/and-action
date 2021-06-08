import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[anaTooltip]',
})
export class TooltipDirective {
  @Input() anaTooltip: string;
  private tooltipContainer: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseout') onMouseOut() {
    this.hideTooltip();
  }

  private showTooltip() {
    this.tooltipContainer = this.renderer.createElement('div');
    this.anaTooltip
      .split('\n')
      .map((line) => {
        const text = this.renderer.createText(line);
        const paragraph = this.renderer.createElement('p');
        this.renderer.appendChild(paragraph, text);
        return paragraph;
      })
      .forEach((text) =>
        this.renderer.appendChild(this.tooltipContainer, text)
      );
    this.renderer.appendChild(this.document.body, this.tooltipContainer);
    this.renderer.addClass(this.tooltipContainer, 'tooltip');

    setTimeout(() => {
      const elementClientRect =
        this.elementRef.nativeElement.getBoundingClientRect();
      const top = elementClientRect.y + elementClientRect.height + 8;
      const left = elementClientRect.x;

      this.renderer.setStyle(this.tooltipContainer, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipContainer, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipContainer, 'left', `${left}px`);
    });
  }

  private hideTooltip() {
    this.renderer.removeChild(this.document.body, this.tooltipContainer);
  }
}
