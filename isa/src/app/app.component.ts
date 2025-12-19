import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(
      loggedIn => this.isLoggedIn = loggedIn
    );
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

    @ViewChild('newestRow') newestRow!: ElementRef;

  newestVideos = [
    { title: 'Newest video 1' },
    { title: 'Newest video 2' },
    { title: 'Newest video 3' },
    { title: 'Newest video 4' },
    { title: 'Newest video 5' }
  ];

  browseVideos = [
    { title: 'Browse video 1' },
    { title: 'Browse video 2' },
    { title: 'Browse video 3' },
    { title: 'Browse video 4' },
    { title: 'Browse video 5' },
    { title: 'Browse video 6' },
    { title: 'Browse video 7' },
    { title: 'Browse video 8' }
  ];

  scrollLeft() {
    this.newestRow.nativeElement.scrollLeft -= 380;
  }

  scrollRight() {
    this.newestRow.nativeElement.scrollLeft += 380;
  }
}