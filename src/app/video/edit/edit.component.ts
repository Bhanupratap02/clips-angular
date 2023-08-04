import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter()
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! your clip is being uploaded';
  uploading = false;
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  clipID = new FormControl('', {
    nonNullable: true,
  });
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });
  constructor(private modal: ModalService, private clipService: ClipService) {}
  ngOnInit(): void {
    this.modal.register('editClip');
  }
  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes,'changes');

    if (!this.activeClip) {
      return;
    }
    this.uploading = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title);
  }
  async submit() {
    if(!this.activeClip){
      return;
    }
    this.uploading = true;
    // this.editForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! your clip is being uploaded';
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (error) {
      console.log(error);
      this.uploading = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong.Try again later';
      return;
    }
    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
     this.uploading = false;
     this.alertColor = 'green';
     this.alertMsg = 'Success! youre clip updated.';
  }
}
