import { Routes } from '@angular/router';
import { PostsComponent } from './posts';
import { ListComponent } from './list/list.component/list.component';
import { CreateComponent } from './create/create.component/create.component';

export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsComponent,
    children: [
      { path: 'list', component: ListComponent },
      { path: 'create', component: CreateComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
