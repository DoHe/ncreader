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

async function initialSync(credentials) {
  const { url } = credentials;
  const headers = authHeaders(credentials);

  const calls = [
    fetch(foldersUrl(url), { headers }),
    fetch(feedsUrl(url), { headers }),
    fetch(unreadItemsUrl(url), { headers }),
    fetch(starredItemsUrl(url), { headers }),
  ];

  try {
    const resolvedCalls = await Promise.all(calls);
    const jsons = await Promise.all(resolvedCalls.map((call) => call.json()));
    const [folders, feeds, items, itemsStarred] = jsons;
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

async function subsequentSync(credentials, lastModified, oldFeeds) {
  const { url } = credentials;
  const headers = authHeaders(credentials);

  const feedIds = oldFeeds.feeds.map((feed) => feed.id);

  let items = [];
  try {
    const itemsResponse = await fetch(updateItemsUrl(url, lastModified), { headers });
    items = await itemsResponse.json();
  } catch (error) {
    console.error(error);
    return {
      folders: { folders: [] },
      feeds: { feeds: [] },
      items: { items: [] },
    };
  }

  let needFullSync = false;
  for (const { feedId } of items.items) {
    if (!feedIds.includes(feedId)) {
      needFullSync = true;
      break;
    }
  }

  if (!needFullSync) {
    return { items, folders: { folders: [] }, feeds: { feeds: [] } };
  }

  const calls = [
    fetch(foldersUrl(url), { headers }),
    fetch(feedsUrl(url), { headers }),
  ];

  try {
    const resolvedCalls = await Promise.all(calls);
    const jsons = await Promise.all(resolvedCalls.map((call) => call.json()));
    const [folders, feeds] = jsons;
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

export { initialSync, subsequentSync };
