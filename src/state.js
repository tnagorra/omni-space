import { DEFAULT_SPACE_NAME, diffObject } from './utils.js';

const SESSION_SPACE_KEY = 'space';

const STORAGE_CURRENT_SPACE_KEY = 'currentSpace';
const STORAGE_SPACES_KEY = 'spaces';

const tabMemory = {
  currentSpace: DEFAULT_SPACE_NAME,
  spaces: [DEFAULT_SPACE_NAME],

  // NOTE: we cannot store tabs on storage.local as tabId changes when new
  // browser is restarted
  // We are using sessions to store space on each tab and getting new tabIds on
  // each load
  tabs: {},
};

export async function setCurrentSpace(val) {
  const prevCurrentSpace = tabMemory.currentSpace;

  const nextCurrentSpace = typeof val === 'function'
    ? val(prevCurrentSpace)
    : val;

  tabMemory.currentSpace = nextCurrentSpace;
  await browser.storage.local.set({ [STORAGE_CURRENT_SPACE_KEY]: nextCurrentSpace });
}
export async function setSpaces(val) {
  const prevSpaces = tabMemory.spaces;

  const nextSpaces = typeof val === 'function'
    ? val(prevSpaces)
    : val;

  tabMemory.spaces = nextSpaces;
  await browser.storage.local.set({ [STORAGE_SPACES_KEY]: nextSpaces });
}
export async function setTabs(val) {
  const prevTabs = tabMemory.tabs;
  const nextTabs = typeof val === 'function'
    ? val(prevTabs)
    : val;

  const {
    added,
    deleted,
    modified,
  } = diffObject(prevTabs, nextTabs);

  tabMemory.tabs = nextTabs;
  await Promise.all([
    ...added.map((addedKey) => browser.sessions.setTabValue(
      +addedKey,
      SESSION_SPACE_KEY,
      nextTabs[addedKey],
    )),
    ...modified.map((modifiedKey) => browser.sessions.setTabValue(
      +modifiedKey,
      SESSION_SPACE_KEY,
      nextTabs[modifiedKey],
    )),
    ...deleted.map((addedKey) => browser.sessions.removeTabValue(
      +addedKey,
      SESSION_SPACE_KEY,
    )),
  ]);
}

export function getCurrentSpace() {
  return tabMemory.currentSpace;
}

export function getSpaces() {
  return tabMemory.spaces;
}

export function getTabs() {
  return tabMemory.tabs;
}

export async function initializeState(queriedTabs) {
  const storage = await browser.storage.local.get([
    STORAGE_CURRENT_SPACE_KEY,
    STORAGE_SPACES_KEY,
  ]);

  const tabSpaces = await Promise.all(
    queriedTabs.map(async (tab) => {
      const space = await browser.sessions.getTabValue(
        tab.id,
        SESSION_SPACE_KEY,
      );
      return {
        tabId: tab.id,
        space,
      };
    }),
  );

  const prevSpaces = storage[STORAGE_SPACES_KEY] || [DEFAULT_SPACE_NAME];
  tabMemory.spaces = prevSpaces;

  const prevCurrentSpace = storage[STORAGE_CURRENT_SPACE_KEY] || DEFAULT_SPACE_NAME;
  tabMemory.currentSpace = prevCurrentSpace;

  const prevTabs = tabSpaces.reduce(
    (acc, tabSpace) => {
      let space = tabSpace.space || prevCurrentSpace;
      if (!prevSpaces.includes(space)) {
        space = DEFAULT_SPACE_NAME;
      }
      return {
        ...acc,
        [tabSpace.tabId]: space,
      };
    },
    {},
  );
  tabMemory.tabs = prevTabs;
}
