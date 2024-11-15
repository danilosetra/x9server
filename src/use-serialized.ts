import 'dotenv/config';
import { IgApiClient } from 'instagram-private-api';
import fs from 'node:fs';

(async () => {
  const ig = new IgApiClient();

  const statePath = `states/${process.env.IG_USERNAME}.json`;
  let userId: string;

  if (fs.existsSync(statePath)) {
    const state = fs.readFileSync(statePath).toString();
    await ig.state.deserialize(state);
    userId = ig.state.extractUserId();
  } else {
    ig.state.generateDevice(process.env.IG_USERNAME);

    const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    userId = loggedInUser.pk.toString();

    const state = await ig.state.serialize();
    delete state.constants;
    fs.writeFileSync(statePath, JSON.stringify(state));
  }

  const userInfo = await ig.user.info(userId);
  const follower_count = userInfo.follower_count;

  console.log(`User id: ${userId}`);
  console.log(`Follower count: ${follower_count}`);
})();
