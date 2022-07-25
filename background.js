import {
  setTabs,

  getTabs,
  getCurrentSpace,

  initializeState,
} from './src/state.js';
import {
  actionItems,
  actionNames,
} from './src/actions/index.js';
import {
  SUGGESTION_INFO,
} from './src/utils.js';
import {
  updateTabsVisibilty,
} from './src/tabs.js';

// NOTE: onInputChanged is not called unless there is another character
// after omibox keyword and a space
browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
  // Split text on omnibox using whitespace
  const [action, ...tokens] = text.trim().split(/\s+/);
  const actionItem = actionItems[action];
  if (!actionItem) {
    // Filter and list actions if there is not action selected
    const suggestions = actionNames
      .filter((actionName) => actionName.startsWith(action))
      .map((actionName) => ({ actionName, action: actionItems[actionName] }))
      .map((item) => ({
        content: `${item.actionName}\n`,
        description: item.action.name,
      }));
    await addSuggestions(suggestions);
  } else {
    // Get suggestion for an action depending on the tokens
    const suggestions = actionItem.getSuggestions({
      tokens,
      action,
      text,
    });
    await addSuggestions(suggestions.map((suggestion) => ({
      // NOTE: Adding a new line so that the suggestion content and text on
      // omnibar will not match
      // If they match, the suggestion is hidden
      content: `${suggestion.content}\n`,
      description: `${suggestion.type || SUGGESTION_INFO} ${suggestion.description}`,
    })));
  }
});

browser.omnibox.onInputEntered.addListener(async (text) => {
  // Split text on omnibox using whitespace
  const [action, ...tokens] = text.trim().split(/\s+/);
  const actionItem = actionItems[action];
  if (!actionItem) {
    await browser.notifications.create(undefined, {
      title: 'Error',
      message: `No action specified: ${text}`,
    });
    return;
  }
  await actionItem.handler(tokens);
});

browser.tabs.onCreated.addListener(async (tab) => {
  await setTabs((oldTabs) => ({
    ...oldTabs,
    [tab.id]: getCurrentSpace(),
  }));
});

browser.tabs.onRemoved.addListener(async (tabId) => {
  await setTabs((oldTabs) => {
    const newTabs = {
      ...oldTabs,
    };
    delete newTabs[tabId];
    return newTabs;
  });
});

browser.tabs.onReplaced.addListener(async (addedTabId, removedTabId) => {
  await setTabs((oldTabs) => {
    const newTabs = {
      ...oldTabs,
      [addedTabId]: oldTabs[removedTabId],
    };
    delete newTabs[removedTabId];
    return newTabs;
  });
});

browser.tabs.onUpdated.addListener(async () => {
  await updateTabsVisibilty(
    getTabs(),
    getCurrentSpace(),
  );
}, {
  properties: ['pinned', 'sharingState'],
});

// Initialize the application
async function initialize() {
  const queriedTabs = await browser.tabs.query({});

  await initializeState(queriedTabs);

  await updateTabsVisibilty(
    getTabs(),
    getCurrentSpace(),
  );
}

initialize();
