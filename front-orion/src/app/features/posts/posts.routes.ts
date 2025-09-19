import { Routes } from '@angular/router';
import { PostsComponent } from './posts';
import { ListComponent } from './list/list.component/list.component';

export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsComponent,
    children: [
      { path: 'list', component: ListComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
