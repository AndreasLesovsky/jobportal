import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToMmSs'
})
export class SecondsToMmSsPipe implements PipeTransform {

  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    // Fügt führende Nullen hinzu, um zweistellige Anzeige zu gewährleisten
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

}
