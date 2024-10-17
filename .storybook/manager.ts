import { CURRENT_STORY_WAS_SET } from '@storybook/core-events';
import { addons } from '@storybook/manager-api';

const CLASS = 'with-addons';
addons.register('enable-toolbar-addons', (api) => {
  const channel = addons.getChannel();
  channel.on(CURRENT_STORY_WAS_SET, () => {
    const storyData = api.getCurrentStoryData();
    const withAddons = !storyData.refId;
    if (withAddons) {
      document.body.classList.add(CLASS);
    } else {
      document.body.classList.remove(CLASS);
    }
  });
});
