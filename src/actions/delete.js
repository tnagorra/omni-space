import {
  setSpaces,
  getSpaces,
  getCurrentSpace,
} from '../state.js';
import {
  DEFAULT_SPACE_NAME,
  SUGGESTION_ERROR,
  SUGGESTION_ACTION,
  notify,
} from '../utils.js';

export default {
  name: 'Delete space',
  getSuggestions: ({ tokens, action, text }) => {
    if (tokens.length > 1) {
      return [{
        content: text,
        description: 'Take it slow!',
        type: SUGGESTION_ERROR,
      }];
    }
    const spaceToDelete = tokens[0];
    if (!spaceToDelete) {
      return getSpaces()
        .map((space) => ({
          content: `${action} ${space}`,
          description: `Delete space ${space}`,
          type: SUGGESTION_ACTION,
        }));
    }
    const index = getSpaces().findIndex((space) => space === spaceToDelete);
    if (index !== -1) {
      return [{
        content: text,
        description: `Delete space ${spaceToDelete}`,
        type: SUGGESTION_ACTION,
      }];
    }

    const suggestions = getSpaces()
      .filter((space) => space.startsWith(spaceToDelete))
      .map((space) => ({
        content: `${action} ${space}`,
        description: `Delete space ${space}`,
        type: SUGGESTION_ACTION,
      }));
    if (suggestions.length >= 1) {
      return suggestions;
    }
    return [{
      content: `${text}`,
      description: `${spaceToDelete} aint a space I know of!`,
      type: SUGGESTION_ERROR,
    }];
  },
  handler: async (tokens) => {
    const spaceToDelete = tokens[0];
    if (!spaceToDelete) {
      await notify('Cannot delete space with no name');
      return;
    }
    if (spaceToDelete === getCurrentSpace()) {
      await notify('Cannot delete current space');
      return;
    }
    if (spaceToDelete === DEFAULT_SPACE_NAME) {
      await notify('Cannot delete space named default');
      return;
    }
    const index = getSpaces().findIndex((space) => space === spaceToDelete);
    if (index === -1) {
      await notify('Cannot delete space that does not exist');
      return;
    }
    await setSpaces((oldSpaces) => {
      const newSpaces = [...oldSpaces];
      newSpaces.splice(index, 1);
      return newSpaces;
    });
  },
};
