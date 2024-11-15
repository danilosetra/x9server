import 'dotenv/config';
import { type ListReelMediaViewerFeedResponseUsersItem, type UserStoryFeedResponseItemsItem } from 'instagram-private-api';
import util from 'node:util';

const getStoryViewers = async (ig) => {
  await new Promise((resolve) => {
    const allStories: UserStoryFeedResponseItemsItem[] = [];
    const storyFeed = ig.feed.userStory(ig.state.extractUserId());
    storyFeed.items$.subscribe(
      (stories: UserStoryFeedResponseItemsItem[]) => {
        allStories.push(...stories);
      },
      (error) => console.error(error),
      () => {
        allStories.forEach((story) => {
          // console.log(util.inspect({ storyViewers: story }, { showHidden: false, depth: null, colors: true }));
          const storyViewers: ListReelMediaViewerFeedResponseUsersItem[] = [];
          const storyViewersFeed = ig.feed.listReelMediaViewers(story.id);
          storyViewersFeed.items$.subscribe(
            (viewers: ListReelMediaViewerFeedResponseUsersItem[]) => {
              storyViewers.push(...viewers);
            },
            (error) => console.error(error),
            () => {
              console.log(
                util.inspect(
                  {
                    story: {
                      id: story.id,
                      viewer_count: story.viewer_count,
                      viewersLength: storyViewers.length,
                    },
                    storyViewers,
                  },
                  { showHidden: true, depth: null, colors: true, maxArrayLength: null },
                ),
              );
              resolve();
            },
          );
        });
      },
    );
  });
};

export default getStoryViewers;
