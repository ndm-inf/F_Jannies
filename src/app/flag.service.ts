import { Injectable } from '@angular/core';
import { GeoCountry } from './geo-country';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MGeoLocation } from './m-geo-location';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  Http: HttpClient;
  constructor(http:HttpClient) {
    this.Http = http;
  }

  public GeoContryRecords: GeoCountry[] = [];  
  public GeoLocationRecords: MGeoLocation[] = [];

  async LoadGeoCountryData() {
    this.Http.get('http://freegeoip.net/json/?callback')
    .subscribe(
       data => console.log('result: ' + data['ip']), // Data from REST
       error => console.error(error),      // Error callback
       () => this.saveIP()                 // Once this call completes
    );
    
  }

  saveIP() {

  }
  async LoadGeoCountryData_old() {  

    this.LoadGeolocations();

    const dataAsPromise = await this.Http.get('assets/geo/GeoLite2-Country-Blocks-IPv4.csv', {responseType: 'text'}).toPromise();

    var dataAsBlob = new Blob([dataAsPromise], {
      type: 'text/plain'
    });

    var reader = new FileReader();
    reader.readAsText(dataAsBlob);  

    reader.onload = () => {  
      let csvData = reader.result;  
      let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);  

      let headersRow = this.getHeaderArray(csvRecordsArray);  

      this.GeoContryRecords = this.getDataRecordsArrayFromCSVFileForGeoCountry(csvRecordsArray, headersRow.length);  
      
      reader.onerror = function () {  
        console.log('error is occured while reading file!');  
      };  
     
    };  

  }  

  public async GetGeoFromIP() {
    const ip = '193.36.117.238';
    console.log('Searching for: ' + ip)
    const geoname =  this.GetCountryLookupFromIP(ip);
    console.log('Geoname ID: ' + geoname);
    const ccode = this.GetCountryFromLookup(geoname);
    console.log('Country Code: ' + ccode);
  }
  
  public async LoadGeolocations() {
    this.LoadGeolocationItem('GeoLite2-Country-Locations-de');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-en');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-es');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-fr');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-ja');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-pt-BR');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-ru');
    this.LoadGeolocationItem('GeoLite2-Country-Locations-zh-CN');
  }

  public async LoadGeolocationItem(path) {
    path = 'assets/geo/' + path + '.csv';
    const dataAsPromise = await this.Http.get(path, {responseType: 'text'}).toPromise();

    var dataAsBlob = new Blob([dataAsPromise], {
      type: 'text/plain'
    });

    var reader = new FileReader();
    reader.readAsText(dataAsBlob);  

    reader.onload = () => {  
      let csvData = reader.result;  
      let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);  

      let headersRow = this.getHeaderArray(csvRecordsArray);  

      const result = this.getDataRecordsArrayFromCSVFileForGeoLocation(csvRecordsArray, headersRow.length);
      
      for (let i = 0; i < result.length; i++) {
        this.GeoLocationRecords.push(result[i]);
      }
      console.log('Geolocation records: ' + this.GeoLocationRecords.length);

      reader.onerror = function () {  
        console.log('error is occured while reading file!');  
      };  
     
    };  

  }

  public GetCountryLookupFromIP(ip: string) {
    for (let i = 0; i < this.GeoContryRecords.length; i++) {
      const splitIP = ip.split('.');
      const search = splitIP[0] + '.' + splitIP[1] + '.' + splitIP[2];
      if(this.GeoContryRecords[i].Network.includes(search)) {
        return this.GeoContryRecords[i].Geoname_ID;
      }
    }
    return 'NOTFOUND';
  }

  public GetCountryFromLookup(geoname_ID: string) {
    for (let i = 0; i < this.GeoLocationRecords.length; i++) {
      if(this.GeoLocationRecords[i].Geoname_ID.trim() === geoname_ID.trim()) {
        return this.GeoLocationRecords[i].Country_ISO_Code;
      }
    }
    return 'NOTFOUND';
  }

  getDataRecordsArrayFromCSVFileForGeoCountry(csvRecordsArray: any, headerLength: any) {  
    let csvArr = [];  
  
    for (let i = 1; i < csvRecordsArray.length; i++) {  
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');  
      if (curruntRecord.length == headerLength) {  
        let csvRecord: GeoCountry = new GeoCountry();  
        csvRecord.Network = curruntRecord[0].trim();  
        csvRecord.Geoname_ID = curruntRecord[1].trim();   
        csvArr.push(csvRecord);  
      }  
    }  
    return csvArr;  
  }  
  
  getDataRecordsArrayFromCSVFileForGeoLocation(csvRecordsArray: any, headerLength: any): MGeoLocation[] {  
    let csvArr:MGeoLocation[] = [];  
  
    for (let i = 1; i < csvRecordsArray.length; i++) {  
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');  
      if (curruntRecord.length == headerLength) {  
        let csvRecord: MGeoLocation = new MGeoLocation();  
        csvRecord.Geoname_ID = curruntRecord[0].trim();  
        csvRecord.Country_ISO_Code = curruntRecord[4].trim();   
        csvArr.push(csvRecord);  
      }  
    }  
    return csvArr;  
  }  
  

  getHeaderArray(csvRecordsArr: any) {  
    let headers = (<string>csvRecordsArr[0]).split(',');  
    let headerArray = [];  
    for (let j = 0; j < headers.length; j++) {  
      headerArray.push(headers[j]);  
    }  
    return headerArray;  
  }  
  
  

  fileReset() {  
    this.GeoContryRecords = [];  
  }  
}
