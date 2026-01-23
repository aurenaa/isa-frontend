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
      const videoId = +id;

      this.videoService.getVideoDetails(videoId).subscribe(data => {
        this.video = data;
      });

      this.videoService.incrementView(videoId).subscribe({
        error: (err) => console.error('Error recording view', err)
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

  onLike(): void {
    if (!this.video) return;

    this.videoService.toggleLike(this.video.id).subscribe({
      next: () => {
        this.video.likedByCurrentUser = !this.video.likedByCurrentUser;
        if (this.video.likedByCurrentUser) {
          this.video.likesCount++;
        } else {
          this.video.likesCount--;
        }
      },
      error: (err) => {
        console.error('Error liking video', err);
        if(err.status === 401) alert("You have to be logged in to like the video!");
      }
    });
  }

}