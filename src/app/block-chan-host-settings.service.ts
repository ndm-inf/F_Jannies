import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BlockChanHostSettingsService {

  public IsHostedOnGithub = true;
  public GitHubRepo = 'BlockChan'; //only populate if hosting site on gh-pages

  public TwitterLink = 'https://twitter.com/ind_imm';
  //public TwitterLink = 'https://twitter.com/blockchan_ca';
 
  // public KeyBaseLink = '';
  public KeyBaseLink = 'https://keybase.io/blockchan';
  public BaseUrl = 'https://ndm-inf.github.io/BlockChan/'
  
  public MainHeader = 'BlockChan';
  public Footer = '';

  public HomeLink = '';
  public BoardsLink = '';
  public AboutLink = '';
  
  constructor() {
    if (this.IsHostedOnGithub) {
      this.HomeLink = this.GitHubRepo + '/';
      this.BoardsLink = this.GitHubRepo + '/boards';
      this.AboutLink = this.GitHubRepo + '/about';
    } else {
      this.HomeLink = '/';
      this.BoardsLink = '/boards';
      this.AboutLink = '/about';
    }
  }
}
