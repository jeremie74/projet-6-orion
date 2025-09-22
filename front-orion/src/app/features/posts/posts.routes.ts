import { Routes } from '@angular/router';
import { PostsComponent } from './posts';
import { ListComponent } from './list/list.component/list.component';
import { PostFormComponent } from './post-form/post-form.component';

export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsComponent,
    children: [
      { path: 'list', component: ListComponent },
      { path: 'create', component: PostFormComponent },
      { path: 'edit/:id', component: PostFormComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
