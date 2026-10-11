import { Component, input } from '@angular/core';
import { Icon } from './icon';

/** Si pasas [src] muestra la foto real; si no, un marcador de posición. */
@Component({
  selector: 'app-photo',
  imports: [Icon],
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="label()" loading="lazy">
    } @else {
      <div class="ph ph--{{ tone() }}" role="img" [attr.aria-label]="label()">
        <app-icon name="scissors" [size]="28" />
        <span>{{ label() }}</span>
      </div>
    }`
})
export class Photo {
  label = input('Fotografía');
  tone = input<'sand' | 'wine' | 'blue' | 'ink'>('sand');
  src = input<string>();
}
