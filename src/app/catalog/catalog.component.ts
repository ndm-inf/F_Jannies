import { Component, OnInit } from '@angular/core';
import {Buffer} from 'buffer';
import { IndImmChanPostService } from '../ind-imm-chan-post.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { IndImmChanPost } from '../ind-imm-chan-post';
import { IndImmChanPostManagerService } from '../ind-imm-chan-post-manager.service';
import { IndImmChanAddressManagerService } from '../ind-imm-chan-address-manager.service';
import { IndImmChanPostModel } from '../ind-imm-chan-post-model';
import { IndImmChanThread } from '../ind-imm-chan-thread';
import { ActivatedRoute } from '@angular/router';
import {Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChunkingUtility } from '../chunking-utility';
import { IndImmConfigService } from '../ind-imm-config.service';
import { GlobalEventService } from '../global-event.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ConfirmEncryptPostComponent } from '../confirm-encrypt-post/confirm-encrypt-post.component';
import { PostKey } from '../post-key';


@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  AddressManagerService: IndImmChanAddressManagerService;
  IndImmChanPostManagerService: IndImmChanPostManagerService;
  GlobalEventService: GlobalEventService;
  Route: ActivatedRoute
  ToastrService: ToastrService;
  Config: IndImmConfigService

  postBoardName = '';
  postTitle = '';
  postMessage = '';
  postBoard  = '';
  posterName = 'Anonymous';
  fileToUpload: File = null;
  resultImage: any = null;
  parentTx = '';
  threads: IndImmChanThread[] = null;
  Router: Router;
  PostLoading = false;
  Posting = false;
  PostingError = false;
  PostingEnabled = true;
  PostingSecondsLeftCounter = 0;
  ShowPostingForm = false;
  PostIsEncrypted = false;
  EncryptedKey:PostKey;
  Dialog: MatDialog;
  EthTipAddress = '';

  constructor(indImmChanPostManagerService: IndImmChanPostManagerService, indImmChanAddressManagerService: IndImmChanAddressManagerService,
    route: ActivatedRoute, router:Router, toasterService: ToastrService, globalEventService: GlobalEventService, config: IndImmConfigService,
    dialog: MatDialog) {
      this.Dialog = dialog;
      this.Config = config;
      this.Route = route;
      this.IndImmChanPostManagerService = indImmChanPostManagerService;
      this.AddressManagerService = indImmChanAddressManagerService;
      this.Router = router;
      this.ToastrService = toasterService;
      this.GlobalEventService = globalEventService;
      this.GlobalEventService.ShowImagesToggled.subscribe(state=>{

        if(state) {
          this.showImagesFromToggle()
        } else {
          this.hideImagesFromToggle();
        }
      });
  
    }
  

  async ConfirmEncryption() {
    const dialogRef = this.Dialog.open(ConfirmEncryptPostComponent, {
      width: '650px',
      panelClass: 'custom-modalbox'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.EncryptedKey = result;
        this.PostIsEncrypted = true;

        const cu:ChunkingUtility = new ChunkingUtility();

        const origValue = 'test';
        console.log('origValue: ' + origValue);

        const enc = await cu.EncryptMessage(origValue, this.EncryptedKey.Key,this.EncryptedKey.IVAsUint8);
        console.log('Enc: ' + enc);

        const dec = await await cu.DecryptMessage(enc,this.EncryptedKey.Key, this.EncryptedKey.IV);
        console.log('dec: ' + dec);

      } else {
        this.PostIsEncrypted = false;
      }
    });
  } 

  async showImagesFromToggle() {
    for (let i = 0; i < this.threads.length; i++) {
      if(!this.threads[i].IndImmChanPostModelParent.Enc) {
        this.IndImmChanPostManagerService.ManualOverRideShowImage(this.threads[i].IndImmChanPostModelParent).then(result=>{
          this.threads[i].IndImmChanPostModelParent = result;
        });
    }
    }
  }

  async hideImagesFromToggle() {
    for (let i = 0; i < this.threads.length; i++) {
      this.IndImmChanPostManagerService.ManualOverRideHideImages(this.threads[i].IndImmChanPostModelParent).then(result=>{
        this.threads[i].IndImmChanPostModelParent = result;
      });          
    }
  }

  togglePostingForm() {
    this.ShowPostingForm = !this.ShowPostingForm;
  }

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

  async refresh() {
    this.PostLoading = true;
    while (!this.IndImmChanPostManagerService.IndImmChanPostService.rippleService.Connected) {
      await this.IndImmChanPostManagerService.IndImmChanPostService.chunkingUtility.sleep(1000);
    }
    const threads = await this.IndImmChanPostManagerService.GetPostsForCatalog(this.AddressManagerService.GetBoardAddress(this.postBoard));
    for (let i = 0; i < threads.length; i++) {
      threads[i].Prep();
    }

    threads.sort(this.compare);
    this.threads = threads;
    this.PostLoading = false;
  }
  
  public handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  async post() {
    if (!this.fileToUpload) {
      this.ToastrService.error('Must include a file.', 'Posting Error');
      return;
    }
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
    if (this.postMessage.length > 420) {
      this.ToastrService.error('Message must be less than 420 characters.', 'Posting Error');
      return;
    }
    if (this.postMessage.length === 0) {
      this.ToastrService.error('Message must not be empty', 'Posting Error');
      return;
    }
    if (this.postTitle.length === 0) {
      this.ToastrService.error('Title must not be empty', 'Posting Error');
      return;
    }
    if (this.postTitle.length> 80) {
      this.ToastrService.error('Title must be less than 80 characters.', 'Posting Error');
      return;
    }

    this.Posting = true;

    try {
      this.blockPosting();
      const tx = await this.IndImmChanPostManagerService.post(this.postTitle, this.postMessage, this.posterName, 
        this.fileToUpload, this.postBoard, this.parentTx, this.EncryptedKey, this.EthTipAddress);
      this.PostingError = false;
      this.Router.navigate(['/postViewer/' + this.postBoard + '/' + tx]);
      // this.refresh();
    } catch (error) {
      console.log(error);
      this.PostingError = true;
      this.PostingEnabled = true;
    }  
    this.Posting = false;
  }
  
  async OpenThread(tx: string){
    this.Router.navigate(['/postViewer/' + this.postBoard + '/' + tx]);

  }
  ngOnInit() {
    this.postBoard = this.Route.snapshot.params['board'];

    if (this.postBoard === 'pol') {
      this.postBoardName = 'Politically Incorrect';
    } else if (this.postBoard === 'biz') {
      this.postBoardName = 'Business';
    } else if (this.postBoard === 'b') {
      this.postBoardName = 'Random';
    }
    this.refresh();
  }

  async ManualOverRideShowImage(post: IndImmChanPostModel) {
    post.ShowFullSizeFile = false;
    await this.IndImmChanPostManagerService.ManualOverRideShowImage(post);
  }


  compare( a: IndImmChanThread, b:IndImmChanThread ) {
    if ( a.LastCommentTime < b.LastCommentTime ){
      return 1;
    }
    if ( a.LastCommentTime > b.LastCommentTime ){
      return -1;
    }
    return 0;
  }
}
