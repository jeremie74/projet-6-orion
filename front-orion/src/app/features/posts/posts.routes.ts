import { Routes } from '@angular/router';
import { PostsComponent } from './posts';
import { ListComponent } from './list/list.component/list.component';
import { PostFormComponent } from './post-form/post-form.component';
import { TopicListComponent } from '../topic/list/topic-list.component';
import { TopicPostsComponent } from '../topic/topic-posts/topic-posts.component';
import { TopicPostDetailComponent } from '../topic/post-detail/topic-post-detail.component';

export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsComponent,
    children: [
      { path: 'list', component: ListComponent },
      { path: 'create', component: PostFormComponent },
      { path: 'edit/:id', component: PostFormComponent },
      { path: 'topics', component: TopicListComponent },
      { path: 'topics/:id', component: TopicPostsComponent },
      { path: 'topics/:topicId/posts/:postId', component: TopicPostDetailComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];
