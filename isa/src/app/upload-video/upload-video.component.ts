import { Component } from '@angular/core';
import { VideoService } from '../service/video.service';
import { Router } from '@angular/router';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';


@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent {
  videoData = { 
    title: '', 
    description: '', 
    tags: [] as string[], 
    location: {
      displayName: '',
      latitude: 0,
      longitude: 0,
      city: '',
      country: ''
    }
  };
  
  tagInput = '';
  selectedVideo: File | null = null;
  selectedThumb: File | null = null;

  suggestions: any[] = [];
  isSearching = false;
  private searchSubject = new Subject<string>();

  constructor(private videoService: VideoService, private router: Router, private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length > 2) {
          this.isSearching = true;
          return this.fetchLocations(term);
        } else {
          this.isSearching = false;
          this.suggestions = [];
          return of([]);
        }
      })
    ).subscribe({
      next: (results) => {
        this.suggestions = results;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      }
    });
  }

  fetchLocations(term: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${term}&addressdetails=1&limit=5`;
    return this.http.get<any[]>(url);
  }

  onLocationInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  selectLocation(suggestion: any) {
    this.videoData.location = {
      displayName: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      city: suggestion.address.city || suggestion.address.town || suggestion.address.village || '',
      country: suggestion.address.country || ''
    };
    this.suggestions = [];
  }

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
              alert('Video published!');
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