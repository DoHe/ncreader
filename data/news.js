import { Buffer } from 'buffer';
import fetchRetry from 'fetch-retry';

const retryFetch = fetchRetry(fetch, {
  retries: 3,
  retryDelay: 100,
});

const feedsUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/feeds`);
const unreadItemsUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/items?type=3&getRead=false&batchSize=-1`);
const starredItemsUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/items?type=2&getRead=true&batchSize=-1`);
const updateItemsUrl = (baseUrl, lastModified) => (
  `${baseUrl}/index.php/apps/news/api/v1-3/items/updated?lastModified=${lastModified}&type=3`
);
const foldersUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/folders`);

function authHeaders({ username, password }) {
  const headers = new Headers();
  headers.set('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  return headers;
}

async function sync(credentials, lastModified) {
  const { url } = credentials;
  const headers = authHeaders(credentials);

  const calls = [
    retryFetch(foldersUrl(url), { headers }),
    retryFetch(feedsUrl(url), { headers }),
  ];

  if (lastModified) {
    calls.push(retryFetch(updateItemsUrl(url, lastModified), { headers }));
  } else {
    calls.push(
      retryFetch(unreadItemsUrl(url), { headers }),
      retryFetch(starredItemsUrl(url), { headers }),
    );
  }

  try {
    const resolved = await Promise.all(calls);
    if (lastModified) {
      const [foldersResolved, feedsResolved, itemsResolved] = resolved;
      const [folders, feeds, items] = await Promise.all(
        [foldersResolved.json(), feedsResolved.json(), itemsResolved.json()],
      );
      return { folders, feeds, items };
    }

    const [foldersResolved, feedsResolved, itemsResolved, itemsStarredResolved] = resolved;
    const [folders, feeds, items, itemsStarred] = await Promise.all(
      [
        foldersResolved.json(),
        feedsResolved.json(),
        itemsResolved.json(),
        itemsStarredResolved.json(),
      ],
    );
    return { folders, feeds, items: [...items, ...itemsStarred] };
  } catch (error) {
    console.error(error);
    return {
      folders: { folders: [] },
      feeds: { feeds: [] },
      items: { items: [] },
    };
  }
}

async function initialSync(credentials) {
  return sync(credentials);
}

async function subsequentSync(credentials, lastModified) {
  return sync(credentials, lastModified);
}

export { initialSync, subsequentSync };
