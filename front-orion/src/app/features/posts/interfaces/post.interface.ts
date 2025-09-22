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

export type PostsState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: Post[];
  error?: string;
};

export type SortValue = 'date_desc' | 'date_asc' | 'title_desc';

export type PostSort = 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface PostQueryOptions {
  sort?: PostSort;
  order?: SortOrder;
}

export type SortOption = {
  value: SortValue;
  label: string;
  query: PostQueryOptions;
};

export const SORT_OPTIONS: SortOption[] = [
  {
    value: 'date_desc',
    label: 'Date décroissante',
    query: { sort: 'createdAt', order: 'desc' },
  },
  {
    value: 'date_asc',
    label: 'Date croissante',
    query: { sort: 'createdAt', order: 'asc' },
  },
  {
    value: 'title_desc',
    label: 'Titre',
    query: { sort: 'title' },
  },
];

export const SORT_OPTION_MAP: Record<SortValue, SortOption> = {
  date_desc: SORT_OPTIONS[0],
  date_asc: SORT_OPTIONS[1],
  title_desc: SORT_OPTIONS[2],
};
