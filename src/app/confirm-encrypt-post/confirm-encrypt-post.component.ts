import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ChunkingUtility } from '../chunking-utility';
import { PostKey } from '../post-key';

@Component({
  selector: 'app-confirm-encrypt-post',
  templateUrl: './confirm-encrypt-post.component.html',
  styleUrls: ['./confirm-encrypt-post.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmEncryptPostComponent implements OnInit {
  PublicKey: string;
  PrivateKey: string;
  GeneratedKey: PostKey;

  constructor(public dialogRef: MatDialogRef<ConfirmEncryptPostComponent>) {}
  
  async GenerateKeys() {
    const cu:ChunkingUtility = new ChunkingUtility();
    const key = await cu.GenerateAESKeyPairs();
    this.GeneratedKey = key;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
