import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';
import { IndImmChanPostService } from './ind-imm-chan-post.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { IndImmChanPost } from './ind-imm-chan-post';
import { IndImmChanPostModel } from './ind-imm-chan-post-model';
import { IndImmChanThread } from './ind-imm-chan-thread';
import { IndImmConfigService } from './ind-imm-config.service';
import { PostKey } from './post-key';
import { ChunkingUtility } from './chunking-utility';


@Injectable({
  providedIn: 'root'
})
export class IndImmChanPostManagerService {
  IndImmChanPostService: IndImmChanPostService;
  Config: IndImmConfigService

  constructor(indImmChanPostService: IndImmChanPostService, config: IndImmConfigService) {
    this.IndImmChanPostService = indImmChanPostService;
    this.Config = config;
  }

  public async post(title: string, message: string, name: string, fileToUpload: File, board: string, parent: string, key: PostKey,
    ethTipAddress: string) {
    const post: IndImmChanPost = new IndImmChanPost();
    post.Name = name;
    post.Title = title;
    post.Msg = message;
    post.Parent = parent;
    post.ETH = ethTipAddress;
    let postMemoType = '';

    if(!parent || parent.length == 0) {
      postMemoType = this.IndImmChanPostService.AddressManagerService.GetChildPostMemoType();
    } else {
      postMemoType = this.IndImmChanPostService.AddressManagerService.GetParentPostMemoType();

    }
    if(fileToUpload) {
      const result = await this.IndImmChanPostService.postToIPFS(fileToUpload);
      post.IPFSHash = result.IpfsHash;
    } else {
      post.IPFSHash = '';        
    }

    if(key) {
      const cu: ChunkingUtility = new ChunkingUtility();
      post.Msg = await cu.EncryptMessage(post.Msg, key.Key, key.IVAsUint8);
      post.Title = await cu.EncryptMessage(post.Title, key.Key, key.IVAsUint8);
      post.Enc= true;
      if(fileToUpload) {
        post.IPFSHash = await cu.EncryptMessage(post.IPFSHash, key.Key, key.IVAsUint8);
      }
    }
    const minLedger = await this.IndImmChanPostService.rippleService.earliestLedgerVersion;
    const txResult  = await this.IndImmChanPostService.postToRipple(post, board, postMemoType);
    return txResult;
  }

  public async GetPostsForPostViewer(boardAddress: string, parent: string): Promise<IndImmChanThread> {
    await this.IndImmChanPostService.rippleService.ForceConnectIfNotConnected();
    while (!this.IndImmChanPostService.rippleService.Connected) {
      await this.IndImmChanPostService.chunkingUtility.sleep(1000);
    }
    const minLedger = this.IndImmChanPostService.rippleService.earliestLedgerVersion;
    const max = this.IndImmChanPostService.rippleService.maxLedgerVersion;
    let imageCounter = 1;

    const unfilteredResults: any[] = await this.IndImmChanPostService.rippleService.api.getTransactions(boardAddress,
      {minLedgerVersion: minLedger, maxLedgerVersion: max});

      const postSet: IndImmChanPostModel[] = [];
      const retSet: IndImmChanThread[] = [];
      const childSet: IndImmChanPostModel[] = [];

      for (let i = 0; i < unfilteredResults.length; i++) {
        if ('memos' in unfilteredResults[i].specification) {
          let post: IndImmChanPost  = null;

          try {
            const dataToParse = unfilteredResults[i].specification.memos[0].data;
            post  = JSON.parse(dataToParse);

            if (post.Name.length === 0) {
              continue;
            }
          } catch (error) {
            console.log(error);
            continue;
          }

          const postModel: IndImmChanPostModel = new IndImmChanPostModel();
          postModel.IPFSHash = post.IPFSHash;
          postModel.Tx = unfilteredResults[i].id;
          postModel.Msg = post.Msg;
          postModel.Title = post.Title
          postModel.Name = post.Name;
          postModel.Parent = post.Parent;
          postModel.ETH = post.ETH;
          postModel.Enc = post.Enc;
          if(post.IPFSHash && post.IPFSHash.length > 0) {
            imageCounter++;
            postModel.HasImage = true;
            if(this.Config.ShowImages && !post.Enc) {
              // postModel.Image = await this.getImageBlobFromIPFSHash(post.IPFSHash); 
              // postModel.CreateImageFromBlob();
              postModel.ImageLoading = true;
              this.getImageBlobFromIPFSHash(postModel).then(res=> {
                postModel.Image = res; 
                postModel.CreateImageFromBlob();
                postModel.ImageLoading = false;
              });
            }
          }
          postModel.Timestamp = new Date(unfilteredResults[i].outcome.timestamp);
          
          if(postModel.Tx === parent || postModel.Parent === parent) {
            postSet.push(postModel);
          }
        }
      }

      for (let i = 0; i < postSet.length; i++) {
        const curPost = postSet[i];
        if(!curPost.Parent || curPost.Parent.length === 0) {
          const newThread: IndImmChanThread = new IndImmChanThread();
          newThread.IndImmChanPostModelParent = curPost;
          retSet.push(newThread);
        } else {
          childSet.push(curPost);
        }
      }

      for (let i = 0; i < childSet.length; i++) {
        const curPost = childSet[i];
        for (let j = 0; j < retSet.length; j++) {
          const parentId = retSet[j].IndImmChanPostModelParent.Tx;
          if (curPost.Parent === parentId) {
            retSet[j].IndImmChanPostModelChildren.push(curPost);
          }
        }
      }
      retSet[0].ImageReplies = imageCounter;
      retSet[0].TotalReplies = retSet[0].IndImmChanPostModelChildren.length;
      return retSet[0];
  }

  public async GetPostsForCatalog(boardAddress: string): Promise<IndImmChanThread[]> {
    await this.IndImmChanPostService.rippleService.ForceConnectIfNotConnected();
    while (!this.IndImmChanPostService.rippleService.Connected) {
      await this.IndImmChanPostService.chunkingUtility.sleep(1000);
    }
    const minLedger = this.IndImmChanPostService.rippleService.earliestLedgerVersion;
    const max = this.IndImmChanPostService.rippleService.maxLedgerVersion;

    const unfilteredResults: any[] = await this.IndImmChanPostService.rippleService.api.getTransactions(boardAddress,
      {minLedgerVersion: minLedger, maxLedgerVersion: max});

      const postSet: IndImmChanPostModel[] = [];
      const retSet: IndImmChanThread[] = [];
      const childSet: IndImmChanPostModel[] = [];

      for (let i = 0; i < unfilteredResults.length; i++) {
        if ('memos' in unfilteredResults[i].specification) {
          let post: IndImmChanPost = null;
          try {
            const dataToParse = unfilteredResults[i].specification.memos[0].data;
            post  = JSON.parse(dataToParse);

            if (post.Name.length === 0) {
              continue;
            }
          } catch (error) {
            console.log(error);
            continue;
          }
          const postModel: IndImmChanPostModel = new IndImmChanPostModel();
          postModel.IPFSHash = post.IPFSHash;
          postModel.Tx = unfilteredResults[i].id;
          postModel.Msg = post.Msg;
          postModel.Title = post.Title
          postModel.Name = post.Name;
          postModel.Parent = post.Parent;
          postModel.Enc = post.Enc;
          postModel.ETH = post.ETH;
          if(post.IPFSHash && post.IPFSHash.length > 0) {
            postModel.HasImage = true;
              if(!postModel.Parent || postModel.Parent.length === 0) {
                if(this.Config.ShowImages && !post.Enc) {
                  // postModel.Image = await this.getImageBlobFromIPFSHash(post.IPFSHash); 
                  // postModel.CreateImageFromBlob();
                  postModel.ImageLoading = true;
                  this.getImageBlobFromIPFSHash(postModel).then(res=> {
                    postModel.Image = res; 
                    postModel.CreateImageFromBlob();
                    postModel.ImageLoading = false;
                  });
                }
            }
          }
          postModel.Timestamp = new Date(unfilteredResults[i].outcome.timestamp);
          postSet.push(postModel);
        }
      }

      for (let i = 0; i < postSet.length; i++) {
        const curPost = postSet[i];
        if(!curPost.Parent || curPost.Parent.length === 0) {
          const newThread: IndImmChanThread = new IndImmChanThread();
          if(curPost.Tx ==='7F9444A0342349AF997EEC992F1121462190242A532773C244B6BB80B0B4EA27') {
            curPost.EncDemo = true;
          }
          newThread.IndImmChanPostModelParent = curPost;
          retSet.push(newThread);
        } else {
          childSet.push(curPost);
        }
      }




      for (let i = 0; i < childSet.length; i++) {
        const curPost = childSet[i];
        for (let j = 0; j < retSet.length; j++) {
          const parentId = retSet[j].IndImmChanPostModelParent.Tx;
          if (curPost.Parent === parentId) {
            if(curPost.IPFSHash && curPost.IPFSHash.length > 0) {
              retSet[j].ImageReplies++;
            }
            retSet[j].TotalReplies++;
            retSet[j].IndImmChanPostModelChildren.push(curPost);
          }
        }
      }
  
      return retSet;
  }

  public async ManualOverRideShowImage(post: IndImmChanPostModel): Promise<IndImmChanPostModel> {
    if (post && !post.ShowImageOverride) {
      post.ImageLoading = true;
      const blob = await this.IndImmChanPostService.getFromIPFS(post.IPFSHash);    
      post.Image = blob;
      post.CreateImageFromBlob();
      post.ShowImageOverride = true;
      post.ImageLoading = false;
      return post; 
    } else {
      return post;
    }
  }

  public async ManualOverRideHideImages(post: IndImmChanPostModel) {
    if(post) {
      try {
        post.ImageLoading = false;
        post.Image = null;
        post.ShowImageOverride = false;
        post.ImageLoading = false;
        post.Base64Image = null;
        return post;
      } catch (error) {
        console.log(error);
        return post;
      } 
    } else {
      return post;
    }
  }

  public async getImageBlobFromIPFSHash(post: IndImmChanPost) {
    const result = this.IndImmChanPostService.getFromIPFS(post.IPFSHash);      
    return result;   
  }
}
