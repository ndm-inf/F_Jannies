import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-tip-dialog',
  templateUrl: './tip-dialog.component.html',
  styleUrls: ['./tip-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TipDialogComponent implements OnInit {
  amount: number;
  constructor(
    public dialogRef: MatDialogRef<TipDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
