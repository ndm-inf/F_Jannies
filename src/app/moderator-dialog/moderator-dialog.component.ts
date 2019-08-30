
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { PostModFlagModel } from '../post-mod-flag-model';

@Component({
  selector: 'app-moderator-dialog',
  templateUrl: './moderator-dialog.component.html',
  styleUrls: ['./moderator-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModeratorDialogComponent implements OnInit {
  flag: PostModFlagModel;
  constructor(
    public dialogRef: MatDialogRef<ModeratorDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
    this.flag = new PostModFlagModel();
  }

}
