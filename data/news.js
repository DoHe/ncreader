import { Buffer } from 'buffer';
import fetchRetry from 'fetch-retry';
import { Alert, Platform } from 'react-native';

const retryFetch = fetchRetry(fetch, {
  retries: 3,
  retryDelay: 100,
});

const feedsUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/feeds`);
const itemsUrl = (baseUrl) => (`${baseUrl}/index.php/apps/news/api/v1-3/items?type=3&getRead=false&batchSize=-1`);
const itemsUpdatedUrl = (baseUrl, lastModified) => (
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

  let urlForItems = '';
  if (lastModified) {
    urlForItems = itemsUpdatedUrl(url, lastModified);
  } else {
    urlForItems = itemsUrl(url);
  }

  const foldersResponse = retryFetch(foldersUrl(url), { headers });
  const feedsResponse = retryFetch(feedsUrl(url), { headers });
  const itemsResponse = retryFetch(urlForItems, { headers });
  const [foldersResolved, feedsResolved, itemsResolved] = await Promise.all([
    foldersResponse, feedsResponse, itemsResponse,
  ]);
  try {
    const [folders, feeds, items] = await Promise.all(
      [foldersResolved.json(), feedsResolved.json(), itemsResolved.json()],
    );
    return { folders, feeds, items };
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
