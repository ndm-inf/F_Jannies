import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
let windowt: any = (<any>window);
@Injectable({
  providedIn: 'root'
})
export class ETHTipService {
  weiConversion:number;

  ToastrService: ToastrService;

  constructor(toastr: ToastrService) { 
    this.ToastrService = toastr;
    this.weiConversion = 1000000000000000000;
  }


async send(destination, amountToSendAsEth: number) { 
  const weiToSend:number = Math.floor(this.weiConversion * amountToSendAsEth);
  const weiToSendAsHex = weiToSend.toString(16)
  
  if (typeof windowt.ethereum === 'undefined') {
    this.ToastrService.error('Please Install MetaMask', 'MetaMask not installed.')    
  } else { 
    try{ 
      const accounts = await windowt.ethereum.enable();
      const account = accounts[0];
      if (windowt.ethereum.networkVersion !== '1') {
        this.ToastrService.error('This application requires the main network, please switch it in your MetaMask UI.', 'Wrong Network');
      }

      this.sendEtherFrom(account, this.sendEtherFromCallBack, destination, weiToSendAsHex);
    } catch (error) {
      this.ToastrService.error('Issue Logging in: ' + error, 'Login Error');
    }

  }
}

sendEtherFromCallBack = (err, transaction) => {
  if (err) {
    this.ToastrService.error('Error: ' + err, 'Error sending tip');
    return;
  }

  this.ToastrService.success('Thanks for the Tip!', 'Success')
}

async sendEtherFrom(account, callback, destination, amountToSendAsWeiHex) {
    const method = 'eth_sendTransaction'
    const parameters = [{
      from: account,
      to: destination,
      value: amountToSendAsWeiHex,
    }]
    const from = account
  
    const payload = {
      method: method,
      params: parameters,
      from: from,
    }
  

    windowt.ethereum.sendAsync(payload,  (err, response) => {
      const rejected = 'User denied transaction signature.'
      if (response.error && response.error.message.includes(rejected)) {
        this.ToastrService.error('You must approve transaction for it to be sent.', 'Error');
      }
      
      if (err) {
        this.ToastrService.error('There was an issue, please try again. ' + err, 'Error');
      }
  
      if (response.result) {
        const txHash = response.result
        this.ToastrService.success('Thank you for your Tip!', 'Success');
  
        this.pollForCompletion(txHash, callback)
      }
    })
  }
  
  pollForCompletion (txHash, callback) {
    let calledBack = false
    const checkInterval = setInterval(function () {
  
      const notYet = 'response has no error or result'
      windowt.ethereum.sendAsync({
        method: 'eth_getTransactionByHash',
        params: [ txHash ],
      }, function (err, response) {
        if (calledBack) return
        if (err || response.error) {
          if (err.message.includes(notYet)) {
            return 'transaction is not yet mined'
          }
  
          callback(err || response.error)
        }
        const transaction = response.result
        clearInterval(checkInterval)
        calledBack = true
        callback(null, transaction)
      })
    }, 2000)
  }
}
