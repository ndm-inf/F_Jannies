import { IndImmChanPostModel } from './ind-imm-chan-post-model';

export class IndImmChanThread {
    IndImmChanPostModelParent: IndImmChanPostModel;
    IndImmChanPostModelChildren: IndImmChanPostModel[] = [];
    constructor() {
        this.IndImmChanPostModelChildren = [];
    }
    TotalReplies = 0;
    ImageReplies = 1;
    LastCommentTime: Date = null;

    public Prep() {
        this.orderRepliesDescending();
        this.populateLastCommentTime();
        this.linkReplies();
    }
    orderRepliesDescending() {
       this.IndImmChanPostModelChildren = this.IndImmChanPostModelChildren.sort(this.compare);
    }

    populateLastCommentTime() {
        if (this.IndImmChanPostModelChildren && this.IndImmChanPostModelChildren.length > 0) {
            this.LastCommentTime = this.IndImmChanPostModelChildren[this.IndImmChanPostModelChildren.length-1].Timestamp;
        } else {
            this.LastCommentTime = this.IndImmChanPostModelParent.Timestamp
        }
    }

    
    linkReplies() {
        const ids: string[] = [];
        ids.push(this.IndImmChanPostModelParent.Tx);
        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            ids.push(this.IndImmChanPostModelChildren[i].Tx)
        }

        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            for (let j = 0; j < ids.length; j++) {
                if(this.IndImmChanPostModelChildren[i].Msg.includes(ids[j])) {
                    this.IndImmChanPostModelChildren[i].Msg =  this.IndImmChanPostModelChildren[i].Msg.replace('>>' + ids[j],
                        '<a title="' + ids[j] + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'+ ids[j]  +'\'">>>' + ids[j].substring(0, 10) + '...</a>');
                }
            }
        }

        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            for (let j = 0; j < this.IndImmChanPostModelChildren.length; j++) {
                if(this.IndImmChanPostModelChildren[j].Msg.includes(this.IndImmChanPostModelChildren[i].Tx)) {
                    const headerLink ='<a title="' + this.IndImmChanPostModelChildren[j].Tx + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'
                        + this.IndImmChanPostModelChildren[j].Tx   +'\'">>>' + this.IndImmChanPostModelChildren[j].Tx.substring(0, 10)  + '...</a>';
                        this.IndImmChanPostModelChildren[i].HeaderLinks = this.IndImmChanPostModelChildren[i].HeaderLinks + headerLink + ' ';                    
                }
            }
        }

        for (let j = 0; j < this.IndImmChanPostModelChildren.length; j++) {
            if(this.IndImmChanPostModelChildren[j].Msg.includes(this.IndImmChanPostModelParent.Tx)) {
                const headerLink ='<a title="' + this.IndImmChanPostModelChildren[j].Tx + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'
                    + this.IndImmChanPostModelChildren[j].Tx   +'\'">>>' + this.IndImmChanPostModelChildren[j].Tx.substring(0, 10)  + '...</a>';
                    this.IndImmChanPostModelParent.HeaderLinks = this.IndImmChanPostModelParent.HeaderLinks + headerLink + ' ';      
            }
        }        
    }
    
    compare( a: IndImmChanPostModel, b:IndImmChanPostModel ) {
        if ( a.Timestamp < b.Timestamp ){
          return -1;
        }
        if ( a.Timestamp > b.Timestamp ){
          return 1;
        }
        return 0;
      }
}
