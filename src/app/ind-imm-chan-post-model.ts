import { IndImmChanPost } from './ind-imm-chan-post';
import { SafeHtml } from '@angular/platform-browser';

export class IndImmChanPostModel extends IndImmChanPost{
    Timestamp: Date;
    Image: Blob;
    HasImage: boolean;
    ShowImageOverride: boolean = false;
    Base64Image: any;
    Tx: string;
    IsOrganized = false;
    ShowFullSizeFile = false;
    MsgSafeHtml: SafeHtml;
    ImageLoading = false;
    HeaderLinks = '';
    EncDemo:boolean = false;
    BackgroundColor: string;
    FontColor: string;
    SendingAddress: '';
    TripCode = '';
    IsWebm = false;
    Country = '';
    public CreateImageFromBlob() {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          this.Base64Image = reader.result;
        }, false);
        if (this.Image) {
          if(this.Image.type === 'video/webm') {
            this.IsWebm = true;
          }
          reader.readAsDataURL(this.Image);
        }
      }
}
