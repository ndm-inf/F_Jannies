import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-anonymous',
  templateUrl: './anonymous.component.html',
  styleUrls: ['./anonymous.component.scss']
})
export class AnonymousComponent implements OnInit, AfterViewInit {
  Meta: Meta;
  Title: Title;

  elmRef: ElementRef;
  constructor(private elementRef: ElementRef, meta: Meta, title: Title) {
    this.elmRef = elementRef;
    this.Meta = meta;
    this.Title = title;
  }

  ngOnInit() {
    /*
    this.removeTagIfExists('twitter:card');
    this.removeTagIfExists('twitter:site');
    this.removeTagIfExists('twitter:creator');
    this.removeTagIfExists('twitter:title');
    this.removeTagIfExists('twitter:description');
    this.removeTagIfExists('twitter:image');

    this.Meta.addTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.Meta.addTag({ name: 'twitter:site', content: '@ind_imm' });
    this.Meta.addTag({ name: 'twitter:creator', content: '@ind_imm' });
    this.Meta.addTag({ name: 'twitter:title', content: 'BlockChan - Anonymize Posting/Browsing'});
    this.Meta.addTag({ name: 'twitter:description', content: 'Tips for Browsing and Posting w/ BlockChan anonymously'});
    this.Meta.addTag({ name: 'twitter:image', content: 'assets/images/biglogo.png' });
    */
  }
  ngAfterViewInit() {
    // const homeelm = this.elmRef.nativeElement.ownerDocument.body.querySelector('#home');
    // homeelm.className = '';
    // homeelm.classList = null;
  }
  removeTagIfExists(tag) {
    const tagToRemove = this.Meta.getTag('name=\'' + tag + '\'');
    if(tagToRemove) {
     this.Meta.removeTagElement(tagToRemove);
    }
  }
}
