import { Component, OnInit,ViewChild,ElementRef,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation:ViewEncapsulation.None,
  providers:[DatePipe]
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: videojs.Player;
  clip?:IClip
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    //  this.id = this.route.snapshot.params['id']
    // above method donot update routes data and components if redirects to same page but below method updates
    this.player = videojs(this.target?.nativeElement);
     this.route.data.subscribe(data =>{
      this.clip = data['clip'] as IClip
      this.player?.src({
        src:this.clip.url,
        type:'video/mp4'
      })
     })
  }
}
