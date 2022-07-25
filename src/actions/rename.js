import {
  setSpaces,
  getSpaces,
  setTabs,
} from '../state.js';
import {
  DEFAULT_SPACE_NAME,
  SUGGESTION_ERROR,
  SUGGESTION_ACTION,
  notify,
} from '../utils.js';

export default {
  name: 'Rename space',
  getSuggestions: ({ tokens, action, text }) => {
    if (tokens.length > 2) {
      return [{
        content: text,
        description: 'Take it slow!',
        type: SUGGESTION_ERROR,
      }];
    }
    const spaceToRename = tokens[0];
    if (!spaceToRename) {
      return getSpaces()
        .map((space) => ({
          content: `${action} ${space}`,
          description: `Rename space ${space}`,
          type: SUGGESTION_ACTION,
        }));
    }
    const index = getSpaces().findIndex((space) => space === spaceToRename);
    if (index !== -1) {
      const newSpace = tokens[1];
      if (!newSpace) {
        return [{
          content: text,
          description: 'Give me a cool space name.',
        }];
      }

      return [{
        content: text,
        description: `Rename space ${spaceToRename} to ${newSpace}`,
        type: SUGGESTION_ACTION,
      }];
    }

    const suggestions = getSpaces()
      .filter((space) => space.startsWith(spaceToRename))
      .map((space) => ({
        content: `${action} ${space}`,
        description: `Rename space ${space}`,
        type: SUGGESTION_ACTION,
      }));
    if (suggestions.length >= 1) {
      return suggestions;
    }
    return [{
      content: `${text}`,
      description: `${spaceToRename} aint a space I know of!`,
      type: SUGGESTION_ERROR,
    }];
  },
  handler: async (tokens) => {
    const spaceToRename = tokens[0];
    const newName = tokens[1];

    if (!spaceToRename) {
      await notify('Cannot rename space with no name');
      return;
    }
    if (!newName) {
      await notify('Cannot rename space with no new name');
      return;
    }
    if (spaceToRename === DEFAULT_SPACE_NAME) {
      await notify('Cannot rename space named default');
      return;
    }
    if (newName === DEFAULT_SPACE_NAME) {
      await notify('Cannot rename to space named default');
      return;
    }

    const index = getSpaces().findIndex((space) => space === spaceToRename);
    if (index === -1) {
      await notify('Cannot rename space that does not exist');
      return;
    }

    const newIndex = getSpaces().findIndex((space) => space === newName);
    if (newIndex !== -1) {
      await notify('Cannot rename to space that already exists');
      return;
    }
    await setSpaces((oldSpaces) => {
      const newSpaces = [...oldSpaces];
      newSpaces.splice(index, 1, newName);
      return newSpaces;
    });
    await setTabs((oldTabs) => Object.keys(oldTabs).reduce(
      (acc, val) => ({
        ...acc,
        [val]: acc[val] === spaceToRename ? newName : acc[val],
      }),
      oldTabs,
    ));
  },
};
