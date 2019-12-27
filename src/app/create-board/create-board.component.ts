import { Component, OnInit } from '@angular/core';
import { CreateBoard } from '../create-board';
import { IndImmChanPostService } from '../ind-imm-chan-post.service';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-create-board',
  templateUrl: './create-board.component.html',
  styleUrls: ['./create-board.component.scss']
})
export class CreateBoardComponent implements OnInit {
  IndImmChanPostService: IndImmChanPostService;
  boardName = '';
  boardAddress = '';
  boardDescription = '';
  boardXRPAddress = '';
  boardXRPSecret = '';
  boardsModXRPAddress = '';
  boardsModXRPSecret = '';

  createdBoardSuccess = false;

  createBoardError = false;
  createBoardErrorMessage = '';

  processingBoardCreation = false;

  constructor(postService: IndImmChanPostService) { 
    this.IndImmChanPostService = postService;
  }

  ngOnInit() {
  }

  async CreateBoard() {
    this.processingBoardCreation = true;

    const createBoardRequest = new CreateBoard();
    createBoardRequest.BoardAddress = this.boardAddress;
    createBoardRequest.BoardDescription = this.boardDescription;
    createBoardRequest.BoardName = this.boardName;
    createBoardRequest.BoardXRPAddress = this.boardXRPAddress;
    createBoardRequest.BoardsModXRPAddress = this.boardsModXRPAddress;

    const creatorValid = await this.IndImmChanPostService.rippleService.IsSenderSecretValid(this.boardXRPAddress, this.boardXRPSecret);
    
    let modValid = true;
    
    if (this.boardsModXRPAddress.length > 0) {
      modValid = await this.IndImmChanPostService.rippleService.IsSenderSecretValid(this.boardsModXRPAddress, this.boardsModXRPSecret);
    }

    if(this.boardName.length == 0) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board Name cannot be empty';
      return;
    }

    if(this.boardDescription.length == 0) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board description cannot be empty';
      return;
    }

    if(this.boardAddress.length == 0) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board address cannot be empty';
      return;
    }


    if(this.boardName.length > 20) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board Name cannot be greater than 20 characters';
      return;
    }

    if(this.boardDescription.length > 80) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board description cannot be greater than 80 characters';
      return;
    }

    if(this.boardAddress.length > 5) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board address cannot be greater than 5 characters';
      return;
    }

    if(this.boardXRPAddress.length == 0) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board XRP address cannot be empty';
      return;
    }

    if(this.boardXRPSecret.length == 0) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Board XRP Secret cannot be empty';
      return;
    }

    if(!creatorValid) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Invald Address/Secret for board creation address';
      return;
    }

    if(!modValid) {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Invald Address/Secret for moderation address';
      return;
    }

    if(this.boardsModXRPAddress === this.boardXRPAddress){
      this.createBoardError = true;
      this.createBoardErrorMessage = "Board XRP address must be different than mod address";
      return;
    }

    var resultTx = await this.IndImmChanPostService.createBoard(createBoardRequest, this.boardXRPAddress, this.boardXRPSecret);
    
    this.processingBoardCreation = false;

    if(resultTx.length > 0 ){
      this.createdBoardSuccess = true;
      this.createBoardError = false;
    } else {
      this.createBoardError = true;
      this.createBoardErrorMessage = 'Error creating board';
    }
  }
}
