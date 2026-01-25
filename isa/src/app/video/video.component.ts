import { RouterTestingModule } from '@angular/router/testing';
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

  comments: any[] = [];
  newCommentText: string = '';

  currentPage: number = 0;
  pageSize: number = 10;
  totalComments: number = 0;
  isLastPage: boolean = false;

  constructor( 
    private route: ActivatedRoute, 
    private videoService: VideoService, 
    private socketService: SocketService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const videoId = +id;

      this.videoService.getVideoDetails(videoId).subscribe(data => {
        this.video = data;
        this.loadComments(videoId);
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

  loadComments(videoId: number, append: boolean = false): void {
    this.commentService.getVideoComments(videoId, this.currentPage, this.pageSize).subscribe(data => {
      if (append) {
        this.comments = [...this.comments, ...data.content];
      } else {
        this.comments = data.content;
      }
      this.totalComments = data.totalElements;
      this.isLastPage = data.last;
    });
  }

  submitComment(): void {
    if (!this.newCommentText.trim()) return;
    this.commentService.addComment(this.video.id, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.currentPage = 0;
        this.loadComments(this.video.id, false);
      }, 
      error: (err) => {
        console.error(err);
        alert(err.error || "Error submitting comment");
      }
    });
  }

  loadNextPage(): void {
    if(!this.isLastPage) {
      this.currentPage++;
      this.loadComments(this.video.id, true);
    }
  }
  
}