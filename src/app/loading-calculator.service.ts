import { Injectable } from '@angular/core';
import { GlobalEventService } from './global-event.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingCalculatorService {
  GlobalEventService: GlobalEventService;

  public CurrentPercentLoaded = 0;
  public TotalTransactionForLoad = 0;
  public CurrentNumberTransactionsLoaded = 0;

  public reset(){
    this.CurrentNumberTransactionsLoaded = 0;
    this.TotalTransactionForLoad = 0;
    this.CurrentPercentLoaded = 0;
  }

  public StartLoading(numberOfCalls: number){
    this.reset();
    this.TotalTransactionForLoad = numberOfCalls;
    this.GlobalEventService.NotifyPercentLoaded(0);
  }

  public IncrementCallInstanceComplete() {
    this.CurrentNumberTransactionsLoaded++;
    this.CurrentPercentLoaded = 100 * (this.CurrentNumberTransactionsLoaded/this.TotalTransactionForLoad)
    var rounded = Math.round( this.CurrentPercentLoaded * 10 ) / 10;
    this.CurrentPercentLoaded = rounded;
    this.GlobalEventService.NotifyPercentLoaded(rounded);
  }
  constructor(globalEventService: GlobalEventService) {
    this.GlobalEventService = globalEventService;
   }
}
