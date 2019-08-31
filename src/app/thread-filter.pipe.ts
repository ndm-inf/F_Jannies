import { Pipe, PipeTransform } from '@angular/core';
import { IndImmChanThread } from './ind-imm-chan-thread';

@Pipe({
  name: 'threadFilter',
  pure: false
})
export class ThreadFilterPipe implements PipeTransform {

  transform(threads: IndImmChanThread[]): IndImmChanThread[] {
    if (!threads || threads.length === 0) {
        return threads;
    }

    const retThreads: IndImmChanThread[] = [];

    for (let i = 0; i < threads.length; i++) {
      if (!threads[i].FilteredBySearch) {
        retThreads.push(threads[i]);
      }
    }
    return retThreads;
}

}
