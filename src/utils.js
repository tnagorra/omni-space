export const SUGGESTION_ACTION = '🙂';
export const SUGGESTION_INFO = '😶';
export const SUGGESTION_ERROR = '☹️';

export const DEFAULT_SPACE_NAME = 'default';

export async function notify(message, title = 'Error', id = 'osp-error') {
  // eslint-disable-next-line
  console.warn(message);

  await browser.notifications.create(id, {
    type: 'basic',
    title,
    message,
  });
}
