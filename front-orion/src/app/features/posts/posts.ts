import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-posts',
  imports: [RouterOutlet],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class PostsComponent {}
