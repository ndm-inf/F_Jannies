import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit {

  elmRef: ElementRef;
  constructor(private elementRef: ElementRef) {
    this.elmRef = elementRef;
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    // const homeelm = this.elmRef.nativeElement.ownerDocument.body.querySelector('#home');
    // homeelm.className = '';
    // homeelm.classList = null;
  }
}
