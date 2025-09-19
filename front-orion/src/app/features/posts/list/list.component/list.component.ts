import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../../../shared/header/header';

@Component({
  selector: 'app-list.component',
  imports: [Header, RouterOutlet],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {}
