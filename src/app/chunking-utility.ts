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
        newPost.Country = post.Country;
        newPost.Parent = post.Parent;
        newPost.Title  = post.Title;
        newPost.Msg = post.Msg;
        newPost.IPFSHash  = post.IPFSHash;
        newPost.Name = post.Name;
        newPost.Enc  = post.Enc;
        newPost.ETH = post.ETH;
        newPost.UID  = post.UID;
        newPost.T = post.T;
        newPost.F = post.F;
        return newPost;
    }

    public GetCountryFromCode(code: string) {
       var mappings=[["AF","Afghanistan"],
["AL","Albania"],
["DZ","Algeria"],
["AS","American Samoa"],
["AD","Andorra"],
["AO","Angola"],
["AI","Anguilla"],
["AQ","Antarctica"],
["AG","Antigua and Barbuda"],
["AR","Argentina"],
["AM","Armenia"],
["AW","Aruba"],
["AU","Australia"],
["AT","Austria"],
["AZ","Azerbaijan"],
["BS","Bahamas (the)"],
["BH","Bahrain"],
["BD","Bangladesh"],
["BB","Barbados"],
["BY","Belarus"],
["BE","Belgium"],
["BZ","Belize"],
["BJ","Benin"],
["BM","Bermuda"],
["BT","Bhutan"],
["BO","Bolivia (Plurinational State of)"],
["BQ","Bonaire, Sint Eustatius and Saba"],
["BA","Bosnia and Herzegovina"],
["BW","Botswana"],
["BV","Bouvet Island"],
["BR","Brazil"],
["IO","British Indian Ocean Territory (the)"],
["BN","Brunei Darussalam"],
["BG","Bulgaria"],
["BF","Burkina Faso"],
["BI","Burundi"],
["CV","Cabo Verde"],
["KH","Cambodia"],
["CM","Cameroon"],
["CA","Canada"],
["KY","Cayman Islands (the)"],
["CF","Central African Republic (the)"],
["TD","Chad"],
["CL","Chile"],
["CN","China"],
["CX","Christmas Island"],
["CC","Cocos (Keeling) Islands (the)"],
["CO","Colombia"],
["KM","Comoros (the)"],
["CD","Congo (the Democratic Republic of the)"],
["CG","Congo (the)"],
["CK","Cook Islands (the)"],
["CR","Costa Rica"],
["HR","Croatia"],
["CU","Cuba"],
["CW","Curaçao"],
["CY","Cyprus"],
["CZ","Czechia"],
["CI","Côte d'Ivoire"],
["DK","Denmark"],
["DJ","Djibouti"],
["DM","Dominica"],
["DO","Dominican Republic (the)"],
["EC","Ecuador"],
["EG","Egypt"],
["SV","El Salvador"],
["GQ","Equatorial Guinea"],
["ER","Eritrea"],
["EE","Estonia"],
["SZ","Eswatini"],
["ET","Ethiopia"],
["FK","Falkland Islands (the) [Malvinas]"],
["FO","Faroe Islands (the)"],
["FJ","Fiji"],
["FI","Finland"],
["FR","France"],
["GF","French Guiana"],
["PF","French Polynesia"],
["TF","French Southern Territories (the)"],
["GA","Gabon"],
["GM","Gambia (the)"],
["GE","Georgia"],
["DE","Germany"],
["GH","Ghana"],
["GI","Gibraltar"],
["GR","Greece"],
["GL","Greenland"],
["GD","Grenada"],
["GP","Guadeloupe"],
["GU","Guam"],
["GT","Guatemala"],
["GG","Guernsey"],
["GN","Guinea"],
["GW","Guinea-Bissau"],
["GY","Guyana"],
["HT","Haiti"],
["HM","Heard Island and McDonald Islands"],
["VA","Holy See (the)"],
["HN","Honduras"],
["HK","Hong Kong"],
["HU","Hungary"],
["IS","Iceland"],
["IN","India"],
["ID","Indonesia"],
["IR","Iran (Islamic Republic of)"],
["IQ","Iraq"],
["IE","Ireland"],
["IM","Isle of Man"],
["IL","Israel"],
["IT","Italy"],
["JM","Jamaica"],
["JP","Japan"],
["JE","Jersey"],
["JO","Jordan"],
["KZ","Kazakhstan"],
["KE","Kenya"],
["KI","Kiribati"],
["KP","Korea (the Democratic People's Republic of)"],
["KR","Korea (the Republic of)"],
["KW","Kuwait"],
["KG","Kyrgyzstan"],
["LA","Lao People's Democratic Republic (the)"],
["LV","Latvia"],
["LB","Lebanon"],
["LS","Lesotho"],
["LR","Liberia"],
["LY","Libya"],
["LI","Liechtenstein"],
["LT","Lithuania"],
["LU","Luxembourg"],
["MO","Macao"],
["MG","Madagascar"],
["MW","Malawi"],
["MY","Malaysia"],
["MV","Maldives"],
["ML","Mali"],
["MT","Malta"],
["MH","Marshall Islands (the)"],
["MQ","Martinique"],
["MR","Mauritania"],
["MU","Mauritius"],
["YT","Mayotte"],
["MX","Mexico"],
["FM","Micronesia (Federated States of)"],
["MD","Moldova (the Republic of)"],
["MC","Monaco"],
["MN","Mongolia"],
["ME","Montenegro"],
["MS","Montserrat"],
["MA","Morocco"],
["MZ","Mozambique"],
["MM","Myanmar"],
["NA","Namibia"],
["NR","Nauru"],
["NP","Nepal"],
["NL","Netherlands (the)"],
["NC","New Caledonia"],
["NZ","New Zealand"],
["NI","Nicaragua"],
["NE","Niger (the)"],
["NG","Nigeria"],
["NU","Niue"],
["NF","Norfolk Island"],
["MP","Northern Mariana Islands (the)"],
["NO","Norway"],
["OM","Oman"],
["PK","Pakistan"],
["PW","Palau"],
["PS","Palestine, State of"],
["PA","Panama"],
["PG","Papua New Guinea"],
["PY","Paraguay"],
["PE","Peru"],
["PH","Philippines (the)"],
["PN","Pitcairn"],
["PL","Poland"],
["PT","Portugal"],
["PR","Puerto Rico"],
["QA","Qatar"],
["MK","Republic of North Macedonia"],
["RO","Romania"],
["RU","Russian Federation (the)"],
["RW","Rwanda"],
["RE","Réunion"],
["BL","Saint Barthélemy"],
["SH","Saint Helena, Ascension and Tristan da Cunha"],
["KN","Saint Kitts and Nevis"],
["LC","Saint Lucia"],
["MF","Saint Martin (French part)"],
["PM","Saint Pierre and Miquelon"],
["VC","Saint Vincent and the Grenadines"],
["WS","Samoa"],
["SM","San Marino"],
["ST","Sao Tome and Principe"],
["SA","Saudi Arabia"],
["SN","Senegal"],
["RS","Serbia"],
["SC","Seychelles"],
["SL","Sierra Leone"],
["SG","Singapore"],
["SX","Sint Maarten (Dutch part)"],
["SK","Slovakia"],
["SI","Slovenia"],
["SB","Solomon Islands"],
["SO","Somalia"],
["ZA","South Africa"],
["GS","South Georgia and the South Sandwich Islands"],
["SS","South Sudan"],
["ES","Spain"],
["LK","Sri Lanka"],
["SD","Sudan (the)"],
["SR","Suriname"],
["SJ","Svalbard and Jan Mayen"],
["SE","Sweden"],
["CH","Switzerland"],
["SY","Syrian Arab Republic"],
["TW","Taiwan (Province of China)"],
["TJ","Tajikistan"],
["TZ","Tanzania, United Republic of"],
["TH","Thailand"],
["TL","Timor-Leste"],
["TG","Togo"],
["TK","Tokelau"],
["TO","Tonga"],
["TT","Trinidad and Tobago"],
["TN","Tunisia"],
["TR","Turkey"],
["TM","Turkmenistan"],
["TC","Turks and Caicos Islands (the)"],
["TV","Tuvalu"],
["UG","Uganda"],
["UA","Ukraine"],
["AE","United Arab Emirates (the)"],
["GB","United Kingdom of Great Britain and Northern Ireland (the)"],
["UM","United States Minor Outlying Islands (the)"],
["US","United States of America (the)"],
["UY","Uruguay"],
["UZ","Uzbekistan"],
["VU","Vanuatu"],
["VE","Venezuela (Bolivarian Republic of)"],
["VN","Viet Nam"],
["VG","Virgin Islands (British)"],
["VI","Virgin Islands (U.S.)"],
["WF","Wallis and Futuna"],
["EH","Western Sahara"],
["YE","Yemen"],
["ZM","Zambia"],
["ZW","Zimbabwe"],
["AX","Åland Islands"]]

        for (let i = 0; i < mappings.length; i++) {
            if (mappings[i][0].toLowerCase() === code.toLowerCase()) {
                return mappings[i][1];
            }
        }
        return 'None';
    }
}
