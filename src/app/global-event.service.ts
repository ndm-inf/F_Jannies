import { Injectable, EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalEventService {
  ShowImagesToggled: EventEmitter<boolean> = new EventEmitter();
  public ToggleShowImages(showImages: boolean) {
    this.ShowImagesToggled.emit(showImages);
  }
  constructor() { }
}
