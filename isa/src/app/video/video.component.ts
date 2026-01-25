import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../service/video.service';
import { SocketService } from '../service/socket.service';
import { Subscription } from 'rxjs';
import { CommentService } from '../service/comment.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
  video: any;
  private socketSubscription: Subscription | undefined;

  constructor( 
    private route: ActivatedRoute, 
    private videoService: VideoService, 
    private socketService: SocketService,
    private CommentService: CommentService
  ) {}

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
        if (!this.video.likedByCurrentUser && this.video.dislikedByCurrentUser) {
          this.video.dislikedByCurrentUser = false;
          this.video.dislikesCount = Math.max(0, this.video.dislikesCount - 1);
        }
        this.video.likedByCurrentUser = !this.video.likedByCurrentUser;
        this.video.likesCount += this.video.likedByCurrentUser ? 1 : -1;
      },
      error: (err) => {
        console.error('Error liking video', err);
        if(err.status === 401) alert("You have to be logged in to like the video!");
      }
    });
  }

  onDislike(): void {
    if (!this.video) return;

    this.videoService.toggleDislike(this.video.id).subscribe({
      next: () => {
        if (this.video.likedByCurrentUser) {
          this.video.likedByCurrentUser = false;
          this.video.likesCount = Math.max(0, this.video.likesCount - 1);
        }
        this.video.dislikedByCurrentUser = !this.video.dislikedByCurrentUser;
        if (this.video.dislikedByCurrentUser) {
          this.video.dislikesCount = (this.video.dislikesCount || 0) + 1;
        } else {
          this.video.dislikesCount = Math.max(0, this.video.dislikesCount - 1);
        }
      },
      error: (err) => {
        console.error('Error disliking video', err);
        if (err.status === 401) alert("You have to be logged in to dislike the video!");
      }
    });
  }
  
}