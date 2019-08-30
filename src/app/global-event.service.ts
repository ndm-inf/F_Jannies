import { Injectable, EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalEventService {
  ShowImagesToggled: EventEmitter<boolean> = new EventEmitter();
  EnableModeration: EventEmitter<boolean> = new EventEmitter();

  public ToggleShowImages(showImages: boolean) {
    this.ShowImagesToggled.emit(showImages);
  }

  public ToggleEnableModeration(isModded: boolean) {
    this.EnableModeration.emit(isModded);
  }
  constructor() { }
}
