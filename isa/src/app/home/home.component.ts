import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { VideoService } from '../service/video.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { 

  isLoggedIn = false;

  newestVideos: any[] = [];
  browseVideos: any[] = [];

  constructor(private authService: AuthService, private videoService: VideoService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(
      loggedIn => this.isLoggedIn = loggedIn
    );
    
    this.videoService.getAllVideos().subscribe({
      next: (videos: any[]) => {
        this.newestVideos = videos;
        this.browseVideos = videos;
      },
      error: (err: any) => {
        console.error('Greška pri učitavanju videa:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  @ViewChild('newestRow') newestRow!: ElementRef;

  //newestVideos = [
  //  { title: 'Newest video 1' },
  //  { title: 'Newest video 2' },
  //  { title: 'Newest video 3' },
  //  { title: 'Newest video 4' },
  //  { title: 'Newest video 5' }
  //];

  //browseVideos = [
  //  { title: 'Browse video 1' },
  //  { title: 'Browse video 2' },
  //  { title: 'Browse video 3' },
  //  { title: 'Browse video 4' },
  //  { title: 'Browse video 5' },
  //  { title: 'Browse video 6' },
  //  { title: 'Browse video 7' },
  //  { title: 'Browse video 8' }
  //];

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
}