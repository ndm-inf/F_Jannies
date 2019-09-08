import { IndImmChanPostModel } from './ind-imm-chan-post-model';

export class IndImmChanThread {
    IndImmChanPostModelParent: IndImmChanPostModel;
    IndImmChanPostModelChildren: IndImmChanPostModel[] = [];
    FilteredBySearch = false;
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

    spoilerAndYoutubeText(post: IndImmChanPostModel) {
        post.Msg = post.Msg.replace('[SPOILER]' , '<span class="spoiler">');
        post.Msg = post.Msg.replace('[/SPOILER]' , '</span>');

        post.Msg = post.Msg.replace("watch?v=", "embed/");
        post.Msg = post.Msg.replace(/(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*((youtube.com)|(youtu.be))[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function($0) { 
            return '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="' + $0 + '" allowFullScreen></iframe></div>';
        });
        post.Msg = this.linkify(post.Msg);
    }

    linkify(inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;;
        // replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
        replacedText = inputText.replace(replacePattern1, function($1) { 
            if (!($1.includes('youtube') || $1.includes('youtu.be'))) {
                return '<a style="color: #337ab7;" href="' + $1 +'" target="_blank">' + $1 +'</a>';
            } else {
                return $1;
            }
        });
        
    
        return replacedText;
    }

    greenText(post: IndImmChanPostModel) {
        const splitMessage = post.Msg.split('\n');

        const newMsgArray: string[] = [];
        let newMsg = '';
        let resultMsg = '';

        for (let i = 0; i < splitMessage.length; i++) {
            const curMsg = splitMessage[i];
            newMsg = curMsg;
            if (curMsg.length>0){
                if (curMsg.charAt(0) === '>') {
                    if (curMsg.length>1){
                        if (curMsg.charAt(1) !== '>') {
                            newMsg = '<span style="color:green">' + curMsg + '</span>'
                        }
                    }
                }
            }
            newMsgArray.push(newMsg);
        }

        for(let i = 0; i < newMsgArray.length; i++) {
            resultMsg += newMsgArray[i] + '\n';
        }
        post.Msg = resultMsg;
    }
    
    linkReplies() {
        const ids: string[] = [];
        ids.push(this.IndImmChanPostModelParent.Tx);
        this.greenText(this.IndImmChanPostModelParent);
        this.spoilerAndYoutubeText(this.IndImmChanPostModelParent);

        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            ids.push(this.IndImmChanPostModelChildren[i].Tx)
            this.greenText(this.IndImmChanPostModelChildren[i]);      
            this.spoilerAndYoutubeText(this.IndImmChanPostModelChildren[i]);  
        }

        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            for (let j = 0; j < ids.length; j++) {
                if(this.IndImmChanPostModelChildren[i].Msg.includes(ids[j])) {
                    this.IndImmChanPostModelChildren[i].Msg =  this.IndImmChanPostModelChildren[i].Msg.replace('>>' + ids[j],
                        '<a onmouseenter="hoverdiv(event, \'' +   ids[j] + ' \');" onmouseleave="hideHoverDiv();" title="' + ids[j] + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'+ ids[j]  +'\'">>>' + ids[j].substring(0, 10) + '...</a>');
                }
            }
        }

        for (let i = 0; i < this.IndImmChanPostModelChildren.length; i++) {
            for (let j = 0; j < this.IndImmChanPostModelChildren.length; j++) {
                if(this.IndImmChanPostModelChildren[j].Msg.includes(this.IndImmChanPostModelChildren[i].Tx)) {
                    const headerLink ='<a onmouseenter="hoverdiv(event, \'' +   this.IndImmChanPostModelChildren[j].Tx + ' \');" onmouseleave="hideHoverDiv();" title="' + this.IndImmChanPostModelChildren[j].Tx + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'
                        + this.IndImmChanPostModelChildren[j].Tx   +'\'">>>' + this.IndImmChanPostModelChildren[j].Tx.substring(0, 10)  + '...</a>';
                        this.IndImmChanPostModelChildren[i].HeaderLinks = this.IndImmChanPostModelChildren[i].HeaderLinks +'<u>' + headerLink + '</u> ';                    
                }
            }
            this.IndImmChanPostModelChildren[i].HeaderLinks = '&nbsp;' + this.IndImmChanPostModelChildren[i].HeaderLinks;
        }
        
        for (let j = 0; j < this.IndImmChanPostModelChildren.length; j++) {
            if(this.IndImmChanPostModelChildren[j].Msg.includes(this.IndImmChanPostModelParent.Tx)) {
                const headerLink ='<a onmouseenter="hoverdiv(event, \'' +   this.IndImmChanPostModelChildren[j].Tx + ' \');" onmouseleave="hideHoverDiv();" title="' + this.IndImmChanPostModelChildren[j].Tx + '" style="color:aqua; cursor: pointer" onClick="window.location.hash=\'#'
                    + this.IndImmChanPostModelChildren[j].Tx   +'\'">>>' + this.IndImmChanPostModelChildren[j].Tx.substring(0, 10)  + '...</a>';
                    this.IndImmChanPostModelParent.HeaderLinks = this.IndImmChanPostModelParent.HeaderLinks + '<u>' + headerLink + '</u> ';      
            }

            // this.IndImmChanPostModelChildren[j].Msg = '<span style="margin:25px; padding:25px">' + this.IndImmChanPostModelChildren[j].Msg + '</span>'
        }        
        this.IndImmChanPostModelParent.HeaderLinks = '&nbsp;' + this.IndImmChanPostModelParent.HeaderLinks;
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
