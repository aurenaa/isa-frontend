import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../service/video.service';
import { SocketService } from '../service/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
  video: any;
  private socketSubscription: Subscription | undefined;

  constructor( private route: ActivatedRoute, private videoService: VideoService, private socketService: SocketService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.videoService.getVideoById(+id).subscribe(data => {
        if(!this.video) {
          this.video = data;
        }
      });
      this.socketSubscription = this.socketService.videoUpdate$.subscribe((updatedVideo: any) => {
        if (this.video && this.video.id === updatedVideo.id){
          this.video.views = updatedVideo.views;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }
}