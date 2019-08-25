import { Component, OnInit } from '@angular/core';
import {Buffer} from 'buffer';
import { IndImmChanPostService } from '../ind-imm-chan-post.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { IndImmChanPost } from '../ind-imm-chan-post';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { IndImmChanPostManagerService } from '../ind-imm-chan-post-manager.service';
import { IndImmChanAddressManagerService } from '../ind-imm-chan-address-manager.service';
import { IndImmChanPostModel } from '../ind-imm-chan-post-model';
import { IndImmChanThread } from '../ind-imm-chan-thread';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser'
import { ChunkingUtility } from '../chunking-utility';
import { IndImmConfigService } from '../ind-imm-config.service';
import { GlobalEventService } from '../global-event.service';
import { PostKey } from '../post-key';
import { ETHTipService } from '../ethtip.service';
import { TipDialogComponent } from '../tip-dialog/tip-dialog.component';

@Component({
  selector: 'app-ind-imm-chan-post-viewer',
  templateUrl: './ind-imm-chan-post-viewer-4.component.html',
  styleUrls: ['./ind-imm-chan-post-viewer-4.component.scss']
})

export class IndImmChanPostViewerComponent implements OnInit {
  AddressManagerService: IndImmChanAddressManagerService;
  IndImmChanPostManagerService: IndImmChanPostManagerService;
  Route: ActivatedRoute;
  Router: Router;
  ToastrService: ToastrService;
  Dialog: MatDialog;

  postTitle = '';
  postMessage = '';
  postBoard  = '';
  postBoardName = '';
  posterName = 'Anonymous';
  fileToUpload: File = null;
  resultImage: any = null;
  parentTx = '';
  thread: IndImmChanThread = null;
  PostLoading = false;
  Posting = false;
  PostingError = false;
  Sanitizer: DomSanitizer
  PostingEnabled = true;
  PostingSecondsLeftCounter = 0;
  Config: IndImmConfigService;
  ShowPostingForm = false;
  GlobalEventService: GlobalEventService
  EncryptedKey: PostKey
  Key = '';
  IV = '';
  PostDecrypted = false;
  EthTipService:ETHTipService
  EthTipAddress = '';
  ShowTripEntry = false;
  TripAddress = '';
  TripSecret = '';
  TripName = '';

  public async blockPosting() {
    this.PostingEnabled = false;
    this.PostingSecondsLeftCounter = 60;
    const cu: ChunkingUtility = new ChunkingUtility();

    for(let i = 0; i < 60; i++) {
      this.PostingSecondsLeftCounter--;
      await cu.sleep(1000);
    }
    this.PostingSecondsLeftCounter = 0;
    this.PostingEnabled = true;
  }

  togglePostingForm() {
    this.ShowPostingForm = !this.ShowPostingForm;
  }
  AddTrip() {
    this.ShowTripEntry = true;
  }
  async decrypt() {
    try {
      const cu: ChunkingUtility = new ChunkingUtility();

      this.decryptPost(this.thread.IndImmChanPostModelParent, true).then(result=>{
        this.thread.IndImmChanPostModelParent = result;
      }).catch(error=>{
        this.ToastrService.error('Error Decrypting Post, plese try again.', 'Decrypt Error');
      });

      for(let i = 0; i < this.thread.IndImmChanPostModelChildren.length; i++) {
        this.decryptPost(this.thread.IndImmChanPostModelChildren[i], false).then(result=>{
          this.thread.IndImmChanPostModelChildren[i] = result;
        });
      }

      const ivAsUint8 = cu.Base64ToUint8(this.IV);      
      this.EncryptedKey = new PostKey()
      this.EncryptedKey.Key = this.Key
      this.EncryptedKey.IVAsUint8 = ivAsUint8;
      this.EncryptedKey.IV = this.IV;
    } catch (error) {
      this.ToastrService.error('Error Decrypting Post, plese try again.', 'Decrypt Error');
    }
  }

  async decryptPost(post: IndImmChanPostModel, isParent: boolean) {
    const origPost = post;
    try {
      const cu: ChunkingUtility = new ChunkingUtility();

      post.Title = await cu.DecryptMessage(post.Title, this.Key, this.IV);
      post.Msg = await cu.DecryptMessage(post.Msg, this.Key, this.IV);
      if(isParent){
        this.PostDecrypted = true;
      }
      if(post.IPFSHash && post.IPFSHash.length > 0) {
        post.IPFSHash = await cu.DecryptMessage(post.IPFSHash, this.Key, this.IV);
        post = await this.IndImmChanPostManagerService.ManualOverRideShowImage(post);
      }

      return post; 
    } catch (error) {
      if(isParent){
        this.ToastrService.error('Error Decrypting Post, plese try again.', 'Decrypt Error');
        this.PostDecrypted = false;
      }
      return origPost;
    }
  }

  async Tip(post:IndImmChanPostModel){
    const dialogRef = this.Dialog.open(TipDialogComponent, {
      width: '325px',
      panelClass: 'custom-modalbox'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (<number>result) {
        console.log('sending eth');
        this.SendEth(post, result)
      } else {
        
      }
    });
  }

  async SendEth(post:IndImmChanPostModel, amount:number) {
    let testEthToSend = 0.00055;
    await this.EthTipService.send(post.ETH, amount);
  }

  OpenPolitics() {
    this.Router.navigate(['/catalog/pol']);
  }

  OpenBusiness() {
    this.Router.navigate(['/catalog/biz']);
  }

  OpenRandom() {
    this.Router.navigate(['/catalog/b']);

  }

  constructor(indImmChanPostManagerService: IndImmChanPostManagerService, indImmChanAddressManagerService: IndImmChanAddressManagerService,
    route: ActivatedRoute, router: Router, toastrSrvice: ToastrService, sanitizer: DomSanitizer, config: IndImmConfigService,
    globalEventService: GlobalEventService, ethTipService:ETHTipService, dialog: MatDialog) {
    this.Dialog = dialog;
    this.IndImmChanPostManagerService = indImmChanPostManagerService;
    this.AddressManagerService = indImmChanAddressManagerService;
    this.Route = route;
    this.Router = router;
    this.ToastrService = toastrSrvice;
    this.Sanitizer = sanitizer;
    this.PostingEnabled = true;
    this.Config = config; 
    this.GlobalEventService = globalEventService;
    this.EthTipService = ethTipService;
    this.GlobalEventService.ShowImagesToggled.subscribe(state=>{
    
      const cu: ChunkingUtility = new ChunkingUtility();
      if(state) {
        this.showImagesFromToggle()
      } else {
        this.hideImagesFromToggle();
      }
    });

  }

  async showImagesFromToggle() {
    
    if(this.PostDecrypted || !this.thread.IndImmChanPostModelParent.Enc){
      this.IndImmChanPostManagerService.ManualOverRideShowImage(this.thread.IndImmChanPostModelParent).then(result=>{
        this.thread.IndImmChanPostModelParent = result;
      });
    }
    for (let i = 0; i < this.thread.IndImmChanPostModelChildren.length; i++) {
      if (this.thread.IndImmChanPostModelChildren[i].IPFSHash && this.thread.IndImmChanPostModelChildren[i].IPFSHash.length > 0
        && (this.PostDecrypted || !this.thread.IndImmChanPostModelParent.Enc)) {
        this.IndImmChanPostManagerService.ManualOverRideShowImage(this.thread.IndImmChanPostModelChildren[i]).then(result=> {
          this.thread.IndImmChanPostModelChildren[i] = result;
        });
      }
    }
  }

  async hideImagesFromToggle() {
    this.IndImmChanPostManagerService.ManualOverRideHideImages(this.thread.IndImmChanPostModelParent).then(result=>{
      this.thread.IndImmChanPostModelParent = result;
    });
      for (let i = 0; i < this.thread.IndImmChanPostModelChildren.length; i++) {
        if (this.thread.IndImmChanPostModelChildren[i].IPFSHash && this.thread.IndImmChanPostModelChildren[i].IPFSHash.length > 0) {
        this.IndImmChanPostManagerService.ManualOverRideHideImages(this.thread.IndImmChanPostModelChildren[i]).then(results => {
          this.thread.IndImmChanPostModelChildren[i] = results;
        });
      }
    }
  }

  public handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  async post() {
    if (this.postMessage.length > 420) {
      this.ToastrService.error('Message must be less than 420 characters.', 'Posting Error');
      return;
    }
    if (this.postMessage.length === 0) {
      this.ToastrService.error('Message is empty', 'Posting Error');
      return;
    }
    if (this.postTitle.length> 80) {
      this.ToastrService.error('Title must be less than 80 characters.', 'Posting Error');
      return;
    }
    if (this.fileToUpload) {
      if (this.fileToUpload.size > 4400000) {
        this.ToastrService.error('File must be below 4 Megs', 'Posting Error');
        return;
      }
      if (!(this.fileToUpload.type === 'image/jpeg' ||
        this.fileToUpload.type === 'image/gif' ||
        this.fileToUpload.type === 'image/png')) {
          this.ToastrService.error('File must be of type Jpeg, Gif, or PNG; Webm coming soon', 'Posting Error');
          return;
      }
    }
    let useTrip = false;

    if(this.TripAddress.length > 0 || this.TripSecret.length > 0) {
      const tripValid = await this.IndImmChanPostManagerService.IndImmChanPostService.rippleService.IsSenderSecretValid(this.TripAddress, this.TripSecret);
      if (tripValid) {
        useTrip = true;
        this.IndImmChanPostManagerService.IndImmChanPostService.TripKey = this.TripAddress;
        this.IndImmChanPostManagerService.IndImmChanPostService.TripSecret = this.TripSecret;
        this.IndImmChanPostManagerService.IndImmChanPostService.TripValid = true;
      } else {
        this.ToastrService.error('Invalid secret/key', 'Error');
        return;
      }
    }  else {
      this.IndImmChanPostManagerService.IndImmChanPostService.TripKey = '';
      this.IndImmChanPostManagerService.IndImmChanPostService.TripSecret = '';
      this.IndImmChanPostManagerService.IndImmChanPostService.TripValid = false;
    }
    
    if(!this.ShowTripEntry) {
      this.posterName = 'Anonymous';
    }

    this.Posting = true;
    try {
      this.blockPosting();
      await this.IndImmChanPostManagerService.post(this.postTitle, this.postMessage, this.posterName, this.fileToUpload,
        this.postBoard, this.parentTx, this.EncryptedKey, this.EthTipAddress, useTrip);
      this.PostingError = false;
      this.refresh();
    } catch (error) {
      console.log(error);
      this.PostingError = true;
      this.PostingEnabled = true;
    }  
    this.Posting = false;
  }

  async refresh() {

    this.PostLoading = true;
    while (!this.IndImmChanPostManagerService.IndImmChanPostService.rippleService.Connected) {
      await this.IndImmChanPostManagerService.IndImmChanPostService.chunkingUtility.sleep(1000);
    }
    await this.IndImmChanPostManagerService.IndImmChanPostService.chunkingUtility.sleep(100);

    window.scrollTo(0,document.body.scrollHeight);

    const threadResult = await this.IndImmChanPostManagerService.GetPostsForPostViewer(this.AddressManagerService.GetBoardAddress(this.postBoard), 
      this.parentTx);
    threadResult.Prep();
    this.thread = threadResult;
    this.PostLoading = false;

    if (this.PostDecrypted) {
      this.decrypt(); 
    }
  }

  async ToggleFullSizeFile(post: IndImmChanPostModel) {
    post.ShowFullSizeFile = !post.ShowFullSizeFile;
  }

  ngOnInit() {
    const board = this.Route.snapshot.params['board'];
    const id = this.Route.snapshot.params['id'];

    console.log('board: ' + board);
    this.postBoard=board;
    if (board === 'pol') {
      this.postBoardName = 'Politically Incorrect';
    } else if (board === 'biz') {
      this.postBoardName = 'Business';
    } else if (board === 'b') {
      this.postBoardName = 'Random';
    }
    this.parentTx=id;
    this.refresh();
  }

  async ManualOverRideShowImage(post: IndImmChanPostModel) {
    post.ShowFullSizeFile = false;
    post.ImageLoading = true;
    await this.IndImmChanPostManagerService.ManualOverRideShowImage(post);
  }

  quoteMessage(tx) {
    this.postMessage = '>>' + tx + '\n' + this.postMessage;
    this.ShowPostingForm = true;
    window.scrollTo(0,0);

  }
  OpenCatalog() {
    this.Router.navigate(['/catalog/' + this.postBoard]);
  }
}
