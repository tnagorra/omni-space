import { DEFAULT_SPACE_NAME } from './utils.js';

export const tabMemory = {
  currentSpace: DEFAULT_SPACE_NAME,
  spaces: [DEFAULT_SPACE_NAME],
  tabs: {},
};

export async function setCurrentSpace(val) {
  tabMemory.currentSpace = typeof val === 'function'
    ? val(tabMemory.currentSpace)
    : val;
  return browser.storage.local.set({ currentSpace: tabMemory.currentSpace });
}
export async function setSpaces(val) {
  tabMemory.spaces = typeof val === 'function'
    ? val(tabMemory.spaces)
    : val;
  return browser.storage.local.set({ spaces: tabMemory.spaces });
}
export async function setTabs(val) {
  tabMemory.tabs = typeof val === 'function'
    ? val(tabMemory.tabs)
    : val;
  return browser.storage.local.set({ tabs: tabMemory.tabs });
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
  const {
    spaces,
    currentSpace,
    tabs,
  } = await browser.storage.local.get({
    currentSpace: DEFAULT_SPACE_NAME,
    spaces: [DEFAULT_SPACE_NAME],
    tabs: {},
  });

  tabMemory.spaces = spaces;
  tabMemory.currentSpace = currentSpace;
  tabMemory.tabs = queriedTabs.reduce(
    (acc, tab) => ({
      ...acc,
      [tab.id]: tabs[tab.id] || tabMemory.currentSpace,
    }),
    {},
  );
}
