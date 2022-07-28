import {
  setSpaces,
  getSpaces,
} from '../state.js';
import {
  DEFAULT_SPACE_NAME,
  SUGGESTION_ERROR,
  SUGGESTION_ACTION,
  notify,
} from '../utils.js';

export default {
  name: 'Create a new space',
  getSuggestions: ({ tokens, text }) => {
    if (tokens.length > 1) {
      return [{
        content: text,
        description: 'Take it slow!',
        type: SUGGESTION_ERROR,
      }];
    }
    const spaceToAdd = tokens[0];
    if (!spaceToAdd) {
      return [{
        content: text,
        description: 'Give me a cool space name.',
      }];
    }
    const index = getSpaces().findIndex((space) => space === spaceToAdd);
    if (index !== -1) {
      return [{
        content: text,
        description: `We already have ${spaceToAdd} at home!`,
        type: SUGGESTION_ERROR,
      }];
    }
    return [{
      content: text,
      description: `Create a new space ${spaceToAdd}`,
      type: SUGGESTION_ACTION,
    }];
  },
  handler: async (tokens) => {
    const spaceToAdd = tokens[0];
    if (!spaceToAdd) {
      await notify('Cannot add space with no name');
      return;
    }
    if (spaceToAdd === DEFAULT_SPACE_NAME) {
      await notify('Cannot add space named default');
      return;
    }
    const index = getSpaces().findIndex((space) => space === spaceToAdd);
    if (index !== -1) {
      await notify('Cannot add space that already exists');
      return;
    }
    await setSpaces((oldSpaces) => ([...oldSpaces, spaceToAdd]));
  },
};
