// NOTE:
// - Tabs that are pinned cannot be hidden.
// - Tabs that are sharing the screen, microphone or camera cannot be hidden.
// - The current active tab cannot be hidden.
// - Tabs that are in the process of being closed cannot be hidden.

// eslint-disable-next-line import/prefer-default-export
export async function updateTabsVisibilty(tabs, currentSpace) {
  const queriedTabs = await browser.tabs.query({});

  const visibleTabs = queriedTabs
    .filter((tab) => tabs[tab.id] === currentSpace)
    .sort((a, b) => b.lastAccessed - a.lastAccessed);

  await browser.tabs.show(visibleTabs.map((tab) => tab.id));

  if (visibleTabs.length <= 0) {
    // NOTE: There should at least be one visible tab
    await browser.tabs.create({ active: true });
  } else {
    // NOTE: Let's set the active tab as the most recently accessed tab on the
    // visible tabs list
    const firstVisibleTab = visibleTabs[0];
    await browser.tabs.update(firstVisibleTab.id, { active: true });
  }

  const hiddenTabs = queriedTabs
    .filter((tab) => tabs[tab.id] !== currentSpace);

  await browser.tabs.hide(hiddenTabs.map((tab) => tab.id));
}
