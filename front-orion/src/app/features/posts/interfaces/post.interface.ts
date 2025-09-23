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
  topicId?: number | string;
  topicName: string;
  authorUsername: string;
  comments: PostComment[];
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<T> = {
  status: AsyncStatus;
  data: T;
  error?: string;
};

export type PostListState = AsyncState<Post[]>;
export type PostDetailState = AsyncState<Post | null>;
export type SubmissionState = AsyncState<null>;

export interface PostPayload {
  title: string;
  content: string;
  topicId: string;
}
