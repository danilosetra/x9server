import { Expo } from 'expo-server-sdk';

const notification = async (messageTxt = 'This is a test notification') => {
  let expo = new Expo();

  let messages = [];
  for (let pushToken of ['ExponentPushToken[Fv6Jf5H1acip1sZhiYOpVP]']) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      body: messageTxt,
      data: { withSome: 'data' },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
};

export default notification;
