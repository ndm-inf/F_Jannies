import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeURI'
})
export class EncodeURIPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const retVal = encodeURI(value);
    return retVal.length;
  }

}
