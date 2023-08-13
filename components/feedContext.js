import { createContext } from 'react';

export const FeedContext = createContext({
  folderId: undefined,
  feedId: undefined,
  unread: false,
});
