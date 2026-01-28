import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { VideoService } from '../service/video.service';
import { PopularVideoService } from '../service/popular-video.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { 

  isLoggedIn = false;

  popularVideos: any[] = [];
  browseVideos: any[] = [];

  constructor(private authService: AuthService, private videoService: VideoService, private popularVideoService: PopularVideoService , private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(
      loggedIn => this.isLoggedIn = loggedIn
    );
    
    this.videoService.getAllVideos().subscribe({
      next: (videos: any[]) => {
        this.browseVideos = videos;
      },
      error: (err: any) => {
        console.error('Error when loading videos:', err);
      }
    });

    const detectedCountry = 'Serbia';

    this.popularVideoService.getLatest(detectedCountry).subscribe({
      next: (data: any) => {
        if (data) {
          if (data.firstVideoId) this.loadSinglePopularVideo(data.firstVideoId);
          if (data.secondVideoId) this.loadSinglePopularVideo(data.secondVideoId);
          if (data.thirdVideoId) this.loadSinglePopularVideo(data.thirdVideoId);
        }
      },
      error: (err) => console.error('Error getting trending videos:', err)
    });
    this.requestAndResolveLocation();
  }

  private loadSinglePopularVideo(id: number) {
    this.videoService.getVideoById(id).subscribe(fullVideo => {
      this.popularVideos.push(fullVideo);
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  @ViewChild('newestRow') newestRow!: ElementRef;

  scrollLeft() {
    this.newestRow.nativeElement.scrollLeft -= 380;
  }

  scrollRight() {
    this.newestRow.nativeElement.scrollLeft += 380;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToSignUp(): void {
    this.router.navigate(['/register']);
  }

  private requestAndResolveLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log("Latitude: " + lat + "\n" + "Longitude: " + lon);
          this.sendToLocationResolver(lat, lon);
        },
        (error) => {
          console.log("Location Status: PERMISSION_DENIED");
          this.sendToLocationResolver();
        }
      );
    } else {
      this.sendToLocationResolver();
    }
  }

  private sendToLocationResolver(lat?: number, lon?: number): void {
    this.videoService.resolveUserLocation(lat, lon).subscribe({
      next: (response) => {
        console.log("Server Response: Location data processed successfully.");
      },
      error: (err) => {
        console.error("Server Response: Error processing location data.", err);
      }
    });
  }
}