import { Component } from '@angular/core';
import { BRAND } from '../core/brand';

@Component({
  selector: 'app-logo',
  template: `
    <span class="logo">
      <svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" fill="var(--ink)" />
        <path d="M5 27 27 5" stroke="var(--ivory)" stroke-width="4" />
        <circle cx="24" cy="24" r="3" fill="var(--blue)" />
      </svg>
      <span class="logo__word"><b>{{ b.first }}</b><span>{{ b.second }}</span></span>
    </span>`
})
export class Logo { b = BRAND; }
