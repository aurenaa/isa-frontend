import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../service/video.service';
import { SocketService } from '../service/socket.service';
import { Subscription, interval } from 'rxjs';
import { CommentService } from '../service/comment.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  video: any;
  private socketSubscription: Subscription | undefined;
  private timerSubscription: Subscription | undefined;

  comments: any[] = [];
  newCommentText: string = '';

  currentPage: number = 0;
  pageSize: number = 10;
  totalComments: number = 0;
  isLastPage: boolean = false;

  videoStreamUrl: string | null = null;
  isWaiting: boolean = false; 
  countdownText: string = '00:00:00';
  private viewRecorded = false;

  chatMessages: any[] = [];
  newMessageTextChat: string = '';
  private chatSubscription: Subscription | undefined;
  private stompSubscription: any;

  constructor( 
    private route: ActivatedRoute, 
    private videoService: VideoService, 
    private socketService: SocketService,
    private commentService: CommentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const videoId = +id;

      this.videoService.getVideoDetails(videoId).subscribe(data => {
        this.video = data;
        this.loadComments(videoId);
        this.runLogic();
        this.initChat();
      });

      this.socketSubscription = this.socketService.videoUpdate$.subscribe((updatedVideo: any) => {
        if (this.video && this.video.id === updatedVideo.id){
          this.video.views = updatedVideo.views;
          this.cdr.detectChanges();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.stompSubscription) this.stompSubscription.unsubscribe();
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

  runLogic(): void {
    this.videoService.getStreamingStatus(this.video.id).subscribe({
        next: (status) => {
          if (!status.available) {
            this.isWaiting = true;
            this.videoStreamUrl = null;
            this.startCountdown(Math.abs(status.offsetSeconds) * 1000);
          } else {
            this.showVideo(status.offsetSeconds);
          }
        },
        error: (err) => {
          if (this.video.scheduledTime) {
            const targetTime = new Date(this.video.scheduledTime).getTime();
            const diff = targetTime - Date.now();
            if (diff > 0) {
              this.isWaiting = true;
              this.startCountdown(diff);
              return;
            }
          }
          this.showVideo();
        }
      });
  }

  showVideo(offset: number = 0): void {
    this.isWaiting = false;
    const ts = new Date().getTime();
    this.videoStreamUrl = `http://localhost:8080/api/videos/${this.video.id}/stream?v=${ts}`;
    
    if (!this.viewRecorded) {
      this.videoService.incrementView(this.video.id).subscribe({
        next: () => this.viewRecorded = true,
        error: (err) => console.error(err)
      });
    }

    this.cdr.detectChanges();
    setTimeout(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      if (v) {
        if (offset > 0) {
          v.currentTime = offset;
          this.preventSeek();
        }
        else if (this.video.scheduledTime) {
          const startTime = new Date(this.video.scheduledTime).getTime();
          const diffInSeconds = Math.floor((Date.now() - startTime) / 1000);
          if (diffInSeconds > 0 && diffInSeconds < (this.video.durationSeconds || 0)) {
            v.currentTime = diffInSeconds;
            this.preventSeek();
          }
        }
        v.muted = true;
        v.play().catch(err => console.warn("Autoplay blocked"));
      }
    }, 600);
  }

  preventSeek(): void {
    const v = document.querySelector('video') as HTMLVideoElement;
    if (!v || !this.video.scheduledTime) return;
    const startTime = new Date(this.video.scheduledTime).getTime();
    v.ontimeupdate = () => {
      const now = Date.now();
      const serverCurrentTimeSeconds = Math.floor((now - startTime) / 1000);
        if (v.currentTime > serverCurrentTimeSeconds) {
            v.currentTime = serverCurrentTimeSeconds;
        }
    };
  }

  updateClock(diff: number): void {
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdownText = `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  }

  isPremiereActive(): boolean {
    if (!this.video || !this.video.scheduledTime || !this.video.durationSeconds) {
      return false;
    }
    const end = new Date(this.video.scheduledTime).getTime() + (this.video.durationSeconds * 1000);
    return Date.now() < end;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  initChat(): void {
    if (!this.isWaiting && !this.isPremiereActive()) return;
    if (!this.socketService.isConnected()) {
      setTimeout(() => this.initChat(), 500);
      return;
    }
    this.stompSubscription = this.socketService.subscribeToChat(this.video.id);
    this.chatSubscription = this.socketService.chatMessage$.subscribe((msg: any) => {
      if (this.video && msg.videoId === this.video.id) {
        this.chatMessages = [...this.chatMessages, msg];
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  sendChat(): void {
    if (this.newMessageTextChat.trim() && this.video && this.isLoggedIn()) {
      const token = localStorage.getItem('jwt');
      let payload = { sub: '', firstName: '', lastName: '' };
      try {
        if (token) payload = JSON.parse(atob(token.split('.')[1]));
      } catch (e) {}
      const chatMsg = {
        authorUsername: payload.sub,
        firstName: (payload as any).firstName || '',
        lastName: (payload as any).lastName || '',
        text: this.newMessageTextChat,
        videoId: this.video.id
      };
      this.socketService.sendChatMessage(chatMsg);
      this.newMessageTextChat = '';
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private startCountdown(diffMs: number) {
    this.updateClock(diffMs);

    this.timerSubscription = interval(1000).subscribe(() => {
      diffMs -= 1000;
      
      if (diffMs <= 0) {
        this.timerSubscription?.unsubscribe();
        this.countdownText = '00:00:00';
        setTimeout(() => this.runLogic(), 1000); 
      } else {
        this.updateClock(diffMs);
      }
      this.cdr.detectChanges();
    });
  }
}