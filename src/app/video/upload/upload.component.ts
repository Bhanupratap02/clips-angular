import { Component, OnDestroy } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin,  switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService:FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init()
  }
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! your clip is being uploaded';
  uploading = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenshotTask?:AngularFireUploadTask;
  screenshots:string[] = []
  selectedScreenshot = ''
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    title: this.title,
  });
  ngOnDestroy(): void {
    // this will cancel  the upload request send to the firebase if compoent destroyed.
    this.task?.cancel();
  }
  async storeFile(event: Event) {
    if(this.ffmpegService.isRunning) {
      return;
    }
    this.isDragover = false;
    // ?? operator : if left side donot return accordting our type then right side of the nullish operator will execute
    // below event possible return undefined so  i added nulish opeartor so that i that happen , null will return
    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files[0] ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type != 'video/mp4') {
      return;
    }
   this.screenshots = await this.ffmpegService.getScreenShots(this.file)
   this.selectedScreenshot = this.screenshots[0]
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! your clip is being uploaded';
    this.uploading = true;
    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    const screenShotBlob =  await this.ffmpegService.blobFromURL(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath,screenShotBlob)
     const screenshotRef = this .storage.ref(screenshotPath)
    combineLatest([this.task.percentageChanges(),
     this.screenshotTask.percentageChanges()
    ]).subscribe((progress) => {
      //console.log(`Uploaded ${Math.round((progress *100))}%`);
      const [clipProgress,screenshotProgress] = progress
      if(!clipProgress || ! screenshotProgress){
        return;
      }
      const total = clipProgress + screenshotProgress
      this.percentage = (total as number) / 200;
    });
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(

        // if use single observable you can use last opearator to get the last value.here we removed that because forkJoin will not return any value until both observable completed


        // it will subcribe the inner observable returned by clipRef.getDownloadURL() but it will loose the snapshot because we are not receive snapshot and not doing anything with that so we will receive url retuned by clipRef.getDownloadURL() in next function
        switchMap(() => forkJoin([
          clipRef.getDownloadURL(),
          screenshotRef.getDownloadURL()
        ]))
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL,screenshotURL] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url:clipURL,
            screenshotURL,
            screenshotFileName:`${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          const clipDocRef = await this.clipsService.createClip(clip);
          console.log(clip);

          this.alertColor = 'green';
          this.alertMsg =
            'Success! your clips is ready to share with the world.';
          this.showPercentage = false;
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later';
          this.uploading = false;
          this.showPercentage = false;
          console.log(error);
        },
      });
  }
}
