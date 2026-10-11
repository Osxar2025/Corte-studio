import { Component, computed, input } from '@angular/core';

/** Iconos con trazos de Lucide (ISC). Sin dependencias externas. */
const ICONS: Record<string, string[]> = {
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  menu: ['M4 12h16', 'M4 6h16', 'M4 18h16'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  plus: ['M5 12h14', 'M12 5v14'],
  clock: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M12 6v6l4 2'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0'],
  scissors: ['M3 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M3 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M20 4 8.12 15.88', 'M14.47 14.48 20 20', 'M8.12 8.12 12 12']
};

@Component({
  selector: 'app-icon',
  template: `<svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @for (d of paths(); track d) { <path [attr.d]="d" /> }
  </svg>`,
  styles: ':host{display:inline-flex;line-height:0}'
})
export class Icon {
  name = input.required<string>();
  size = input(20);
  paths = computed(() => ICONS[this.name()] ?? []);
}
