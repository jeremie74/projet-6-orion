export interface PostComment {
  id: number | string;
  content: string;
  createdAt: string;
  authorUsername: string;
}

export interface Post {
  id: number | string;
  title: string;
  content: string;
  createdAt: string;
  topicName: string;
  authorUsername: string;
  comments: PostComment[];
}
