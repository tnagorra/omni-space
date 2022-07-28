export const SUGGESTION_ACTION = '🙂';
export const SUGGESTION_INFO = '😶';
export const SUGGESTION_ERROR = '☹️';

export const DEFAULT_SPACE_NAME = 'default';

export async function notify(message, title = 'Error', id = 'osp-error') {
  // eslint-disable-next-line
  if (title === 'Error') {
    console.error(message);
  } else {
    console.info(message);
  }

  await browser.notifications.create(id, {
    type: 'basic',
    title,
    message,
    iconUrl: browser.extension.getURL('icons/icon.png'),
  });
}

export function diffObject(foo, bar) {
  const fooKeys = new Set(Object.keys(foo));
  const barKeys = new Set(Object.keys(bar));

  const added = [...barKeys].filter((barKey) => (
    !fooKeys.has(barKey)
    || (bar[barKey] && !foo[barKey])
  ));
  const deleted = [...fooKeys].filter((fooKey) => (
    !barKeys.has(fooKey)
    || (foo[fooKey] && !bar[fooKey])
  ));

  const modified = [...barKeys].filter((barKey) => (
    fooKeys.has(barKey)
    && bar[barKey]
    && foo[barKey]
    && bar[barKey] !== foo[barKey]
  ));

  return {
    deleted,
    added,
    modified,
  };
}
