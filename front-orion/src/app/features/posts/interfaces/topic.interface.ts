import type { AsyncState } from './post.interface';

export interface Topic {
  id: number | string;
  description: string;
  name: string;
}

export type TopicListState = AsyncState<Topic[]>;
