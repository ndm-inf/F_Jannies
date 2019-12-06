import { Injectable, EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalEventService {
  ShowImagesToggled: EventEmitter<boolean> = new EventEmitter();
  EnableModeration: EventEmitter<boolean> = new EventEmitter();
  PercentLoaded: EventEmitter<number> = new EventEmitter();

  public ToggleShowImages(showImages: boolean) {
    this.ShowImagesToggled.emit(showImages);
  }

  public ToggleEnableModeration(isModded: boolean) {
    this.EnableModeration.emit(isModded);
  }

  public NotifyPercentLoaded(percentLoaded: number) {
    this.PercentLoaded.emit(percentLoaded);
  }
  constructor() { }
}
