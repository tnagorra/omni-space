import {
  setTabs,
  getSpaces,
  getTabs,
  getCurrentSpace,
} from '../state.js';
import {
  updateTabsVisibilty,
} from '../tabs.js';
import {
  SUGGESTION_ERROR,
  SUGGESTION_ACTION,
  notify,
} from '../utils.js';

export default {
  name: 'Move space',
  getSuggestions: ({ tokens, action, text }) => {
    if (tokens.length > 1) {
      return [{
        content: text,
        description: 'Take it slow!',
        type: SUGGESTION_ERROR,
      }];
    }
    const spaceToMove = tokens[0];
    if (!spaceToMove) {
      // TODO: remove current space
      return getSpaces()
        .map((space) => ({
          content: `${action} ${space}`,
          description: `Move to space ${space}`,
          type: SUGGESTION_ACTION,
        }));
    }
    const index = getSpaces().findIndex((space) => space === spaceToMove);
    if (index !== -1) {
      return [{
        content: text,
        description: `Move to space ${spaceToMove}`,
        type: SUGGESTION_ACTION,
      }];
    }

    const suggestions = getSpaces()
      .filter((space) => space.startsWith(spaceToMove))
      .map((space) => ({
        content: `${action} ${space}`,
        description: `Move to space ${space}`,
        type: SUGGESTION_ACTION,
      }));
    if (suggestions.length >= 1) {
      return suggestions;
    }
    return [{
      content: `${text}`,
      description: `${spaceToMove} aint a space I know of!`,
      type: SUGGESTION_ERROR,
    }];
  },
  handler: async (tokens) => {
    const spaceToMove = tokens[0];
    if (!spaceToMove) {
      await notify('Cannot move tab to space with no name');
      return;
    }
    if (spaceToMove === getCurrentSpace()) {
      await notify('Cannot move tab to current space');
      return;
    }
    const index = getSpaces().findIndex((space) => space === spaceToMove);
    if (index === -1) {
      await notify('Cannot move tab to space that does not exist');
      return;
    }

    const currentTabs = await browser.tabs.query({
      active: true,
      windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    const currentTab = currentTabs[0];

    await setTabs((oldTabs) => ({
      ...oldTabs,
      [currentTab.id]: spaceToMove,
    }));

    await updateTabsVisibilty(getTabs(), getCurrentSpace());
  },
};
