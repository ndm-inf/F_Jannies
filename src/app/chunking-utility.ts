import * as sjcl from 'sjcl';
import { PostKey } from './post-key';
import {Buffer} from 'buffer';
import {Md5} from 'ts-md5/dist/md5';
import { IndImmChanPostModel } from './ind-imm-chan-post-model';

export class ChunkingUtility {

    public async start(fileAsBase64: string) {
        const imageAsBase64Array = await this.chunkStringToBase64Array(900, fileAsBase64);
        return await this.dechunkBase64ArrayToString(imageAsBase64Array);
    }

    public async GetSha256(file) {
        const bitArray = sjcl.hash.sha256.hash(file);

        const digest_sha256 = sjcl.codec.hex.fromBits(bitArray);

        return digest_sha256;
    }

    public async chunkStringToBase64Array(chunkSize, imageAsBase64) {
        const imageCharLength = imageAsBase64.length;
        const numberOfChunks = Math.ceil(imageCharLength / chunkSize);
        const returnChunkImageArray  = [];

        console.log('Begin chunking');
        console.log('Image character length: ' + imageCharLength);
        console.log('Number of chunks needed: ' + numberOfChunks);
        console.log('SHA256: ' + await this.GetSha256(imageAsBase64));

        const currentChunkCounter = 0;
        for (let i = 0; i < numberOfChunks; i++) {

            let currentChunk = '';

            if (i === numberOfChunks - 1) {
                currentChunk = imageAsBase64.substring(i * chunkSize);
            } else {
                currentChunk = imageAsBase64.substring(i * chunkSize, i * chunkSize + chunkSize);
            }

            returnChunkImageArray.push(currentChunk);
        }
        return returnChunkImageArray;
    }

    public async dechunkBase64ArrayToString(imageAsBase64Array) {
        let imageAsBase64String = '';

        console.log('Begin dechunking');
        console.log('Number of Chunks: ' + imageAsBase64Array.length);

        for (let i = 0; i < imageAsBase64Array.length; i++) {
            imageAsBase64String = imageAsBase64String + imageAsBase64Array[i];
        }

        console.log('SHA256: ' + await this.GetSha256(imageAsBase64String));


        return imageAsBase64String;
    }

    public async bin2String(array) {
        let result = '';
        for (let i = 0; i < array.length; i++) {
          result += String.fromCharCode(parseInt(array[i], 2));
        }
        return result;
      }

    public async binb2rstr(input) {
        const str = [];
        for (let i = 0, n = input.length * 32; i < n; i += 8) {
            // tslint:disable-next-line:no-bitwise
            const code = (input[i >> 5] >>> (24 - i % 32)) & 0xFF;
            const val = String.fromCharCode(code);
            str.push(val);
        }
        return str.join('');
    }

    public StringToHex(stringToConvert) {
        // stringToConvert = encodeURI(stringToConvert);
        let hex, i;

        let result = '';
        for (i = 0; i < stringToConvert.length; i++) {
            hex = stringToConvert.charCodeAt(i).toString(16);
            result += hex; // ('000' + hex).slice(-4);
        }

        return result;
    }

    public async sleep(ms: number) {
        return new Promise(resolve => (setTimeout(resolve, ms)));
    }

    public cc(str, num) {  
        var result = '';
        var charcode = 0;
    
        for (var i = 0; i < str.length; i++) {
            charcode = (str[i].charCodeAt()) + num;
            result += String.fromCharCode(charcode);
        }
        return result;
    }

    public strToBuffer (string) {
        let arrayBuffer = new ArrayBuffer(string.length * 1);
        let newUint = new Uint8Array(arrayBuffer);
        newUint.forEach((_, i) => {
          newUint[i] = string.charCodeAt(i);
        });
        return newUint;
      }
      
    public cd(str, num) {   
        var result = '';
        var charcode = 0;
    
        for (var i = 0; i < str.length; i++) {
            charcode = (str[i].charCodeAt()) - num;
            result += String.fromCharCode(charcode);
        }
        return result;
    }

    public async GenerateAESKeyPairs() {
        const key = await window.crypto.subtle.generateKey(
            {
            name: "AES-GCM",
            length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
        const exportedKey  = await crypto.subtle.exportKey('raw', key);
        const exportedKeyBuffer = new Uint8Array(exportedKey);
        const keyAsText = new ChunkingUtility().Uint8ToBase64(exportedKeyBuffer); 
        
        const postKey = new PostKey();
        postKey.Key= keyAsText;
        postKey.IVAsUint8 = window.crypto.getRandomValues(new Uint8Array(16));
        postKey.IV = this.Uint8ToBase64(postKey.IVAsUint8);
        return postKey;
    }

    public async EncryptMessage(str: string, base64Key: string, iv:Uint8Array) {
        const encoded = this.strToBuffer(str);
        const key = await this.ConvertBase64KeyToKey(base64Key);

        const encryptedStringAsBufferArray = await window.crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: iv
            },
            key,
            encoded
          );
        
        const retVal = this.arrayBufferToBase64(encryptedStringAsBufferArray);
        return retVal;
    }

    public async DecryptMessage(base64String: string, base64Key, ivAsBase64: string){
        const iv = this.Base64ToUint8(ivAsBase64);
        const key = await this.ConvertBase64KeyToKey(base64Key);
        const encoded = await this.base64ToArrayBuffer(base64String);
        const decoded = await window.crypto.subtle.decrypt({
            name: "AES-GCM",
            iv: iv
          }, key, encoded);
        
        const retval =this.arrayBufferToString(decoded);
        return retval;
    }

    public async ConvertBase64KeyToKey(str: string) {
        const uint = await  this.Base64ToUint8(str);
        const importedKey = await crypto.subtle.importKey('raw', uint, "AES-GCM", true, ["encrypt", "decrypt"]);
        return importedKey;
    }

    public base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    public arrayBufferToString(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }
    public arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }

    public Base64ToUint8(str: string) {
        var padding = '='.repeat((4 - str.length % 4) % 4);
        var base64 = (str + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
      
        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);
      
        for (var i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;    
    }

    public Uint8ToBase64(u8Arr){
        var CHUNK_SIZE = 0x8000; //arbitrary number
        var index = 0;
        var length = u8Arr.length;
        var result = '';
        var slice;
        while (index < length) {
          slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
          result += String.fromCharCode.apply(null, slice);
          index += CHUNK_SIZE;
        }
        return btoa(result);
      }

    public Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;
    
        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
        c = array[i++];
        switch(c >> 4)
        { 
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
            break;
        }
        }
    
        return out;
    }

    public GetFingerPrint() {
        const fingerPrint = this.getFingerPrint(window, screen, navigator);
        console.log('fingerPrint: ' + fingerPrint);     
        return fingerPrint;
    }

    public GetColorCodeFingerPrint(fingerPrint) {
        var hexString = Buffer.from(fingerPrint, 'base64').toString('hex')
        return hexString.substring(0, 6);
    }

    private getFingerPrint(window, screen, navigator) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).substring(0, 7);
    }

    public InvertColor(hexColor) {
        const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

        hexColor = hexColor.replace(/^\#/, '');

        var r = parseInt(hexColor.substr(0, 2), 16);
        var g = parseInt(hexColor.substr(2, 2), 16);
        var b = parseInt(hexColor.substr(4, 2), 16);
    
        var averageBrightness = arrAvg([r, g, b]);
    
        if (averageBrightness > 128) {
            return "#000000";
        }
        else {
            return "#FFFFFF";
        }
    }
    
    public GetMd5(str) {
        const md5 = new Md5();
        return md5.appendStr(str).end();
    }

    public HydratePostModel(post: IndImmChanPostModel) {
        
    // goofy as fuck but object is not keeping it's function attached
        const newPost: IndImmChanPostModel = new IndImmChanPostModel();
        newPost.Timestamp = post.Timestamp;
        newPost.Image = post.Image;
        newPost.HasImage = post.HasImage;
        newPost.ShowImageOverride = post.ShowImageOverride;
        newPost.Base64Image = post.Base64Image;
        newPost.Tx = post.Tx;
        newPost.IsOrganized = post.IsOrganized;
        newPost.ShowFullSizeFile = post.ShowFullSizeFile;
        newPost.MsgSafeHtml = post.MsgSafeHtml;
        newPost.ImageLoading = post.ImageLoading;
        newPost.HeaderLinks = post.HeaderLinks;
        newPost.EncDemo = post.EncDemo;
        newPost.BackgroundColor = post.BackgroundColor;
        newPost.FontColor = post.FontColor;
        newPost.SendingAddress = post.SendingAddress;
        newPost.TripCode = post.TripCode;

        newPost.Parent = post.Parent;
        newPost.Title  = post.Title;
        newPost.Msg = post.Msg;
        newPost.IPFSHash  = post.IPFSHash;
        newPost.Name = post.Name;
        newPost.Enc  = post.Enc;
        newPost.ETH = post.ETH;
        newPost.UID  = post.UID;
        newPost.T = post.T;

        return newPost;
    }
}
