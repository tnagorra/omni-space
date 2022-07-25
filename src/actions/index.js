import createAction from './create.js';
import deleteAction from './delete.js';
import renameAction from './rename.js';
import jumpAction from './jump.js';
import moveAction from './move.js';

export const actionItems = {
  create: createAction,
  delete: deleteAction,
  rename: renameAction,
  jump: jumpAction,
  move: moveAction,
};

export const actionNames = Object.keys(actionItems);
