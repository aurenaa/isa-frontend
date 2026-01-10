import { Component } from '@angular/core';
import { VideoService } from '../service/video.service';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent {
  videoData = { title: '', description: '', tags: [] as string[], location: '' };
  tagInput = '';
  selectedVideo: File | null = null;
  selectedThumb: File | null = null;

  constructor(private videoService: VideoService, private router: Router) {}

  addTag() {
    if (this.tagInput.trim()) {
      this.videoData.tags.push(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  onVideoSelected(event: any) { 
    this.selectedVideo = event.target.files[0]; 
  }
  
  onThumbSelected(event: any) { 
    this.selectedThumb = event.target.files[0]; 
  }

  onSubmit() {
    if (this.selectedVideo && this.selectedThumb) {
      this.videoService.uploadVideo(this.videoData, this.selectedVideo, this.selectedThumb)
        .subscribe({
          next: (event: any) => {
            if (event instanceof HttpResponse) {
              alert('Video published! 🎥');
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            alert('Upload failed: ' + err.message);
          }
        });
    }
  }
}