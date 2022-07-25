import {
  setCurrentSpace,

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
  name: 'Jump to space',
  getSuggestions: ({ tokens, action, text }) => {
    if (tokens.length > 1) {
      return [{
        content: text,
        description: 'Take it slow!',
        type: SUGGESTION_ERROR,
      }];
    }
    const spaceToSwitch = tokens[0];
    if (!spaceToSwitch) {
      return getSpaces()
        .map((space) => ({
          content: `${action} ${space}`,
          description: `Jump to space ${space}`,
          type: SUGGESTION_ACTION,
        }));
    }
    const index = getSpaces().findIndex((space) => space === spaceToSwitch);
    if (index !== -1) {
      if (spaceToSwitch === getCurrentSpace()) {
        return [{
          content: text,
          description: `Already in space ${spaceToSwitch}!`,
          type: SUGGESTION_ERROR,
        }];
      }
      return [{
        content: text,
        description: `Jump to space ${spaceToSwitch}`,
        type: SUGGESTION_ACTION,
      }];
    }

    const suggestions = getSpaces()
      // TODO: remove current space
      .filter((space) => space.startsWith(spaceToSwitch))
      .map((space) => ({
        content: `${action} ${space}`,
        description: `Jump to space ${space}`,
        type: SUGGESTION_ACTION,
      }));
    if (suggestions.length >= 1) {
      return suggestions;
    }
    return [{
      content: text,
      description: `${spaceToSwitch} aint a space I know of!`,
      type: SUGGESTION_ERROR,
    }];
  },
  handler: async (tokens) => {
    const spaceToJump = tokens[0];
    if (!spaceToJump) {
      notify('Cannot jump to space with no name');
      return;
    }
    const index = getSpaces().findIndex((space) => space === spaceToJump);
    if (index === -1) {
      notify('Cannot jump to space that does not exist');
      return;
    }
    await setCurrentSpace(spaceToJump);
    await updateTabsVisibilty(getTabs(), getCurrentSpace());
  },
};
