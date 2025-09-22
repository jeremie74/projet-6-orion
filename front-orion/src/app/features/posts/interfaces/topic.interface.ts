import type { AsyncState } from './post.interface';

export interface Topic {
  id: number | string;
  name: string;
}

export type TopicListState = AsyncState<Topic[]>;
