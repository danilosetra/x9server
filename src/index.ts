import 'dotenv/config';
import getStoryViewers from './get-story-viewers.ts';
import notification from './notification.ts';
import IGUser from './user.ts';

const user = new IGUser({ username: process.env.IG_USERNAME, password: process.env.IG_PASSWORD });
await user.setup();

console.log(`Follower count: ${user.info.follower_count}`);

await getStoryViewers(user.ig);
await notification('kkkkk');

console.log('done.');
