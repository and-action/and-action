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
  @Input() anaTooltip: string | null;
  private tooltipContainer?: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    if (!this.anaTooltip) {
      return;
    }
    this.tooltipContainer = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipContainer, 'visibility', 'hidden');
    this.anaTooltip
      .split('\n')
      .map((line) => {
        const paragraph = this.renderer.createElement('p');
        this.renderer.setProperty(paragraph, 'innerHTML', line);
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

      this.renderer.setStyle(this.tooltipContainer, 'visibility', 'visible');
      this.renderer.setStyle(this.tooltipContainer, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipContainer, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipContainer, 'left', `${left}px`);
    });
  }

  private hideTooltip() {
    if (this.tooltipContainer) {
      this.renderer.removeChild(this.document.body, this.tooltipContainer);
    }
  }
}
