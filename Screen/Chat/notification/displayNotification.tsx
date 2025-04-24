// import notifee, {AndroidImportance} from '@notifee/react-native';
// import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

// // interface RemoteMessage {
// //   notification?: {
// //     title?: string;
// //     body?: string;
// //   };
// // }

// // Initialize the channel once
// export const initializeNotificationChannel = async () => {
//   // const channelId = await notifee.createChannel({
//   //   id: 'default',
//   //   name: '알림 채널',
//   //   badge: true,
//   //   //     importance: AndroidImportance.HIGH,
//   // });
//   // console.log('channelId = ', channelId);
// };

// // Display notification
// export const displayNotification = async (
//   remoteMessage: FirebaseMessagingTypes.RemoteMessage,
// ) => {
//   console.log('remoteMessage =', remoteMessage);

//   const channelId = await notifee.createChannel({
//     id: 'default',
//     name: '알림 채널',
//     sound: 'default',
//     badge: true,
//     importance: AndroidImportance.HIGH,
//   });

//   //   // Display the notification
//   await notifee.displayNotification({
//     title: remoteMessage.notification?.title,
//     body: remoteMessage.notification?.body,
//     android: {
//       channelId,
//       pressAction: {
//         id: 'default',
//       },
//       color: 'red',
//     },
//   });
// };

// export const displayNotificationNoParams = async () => {
//   // console.log('remoteMessage =', remoteMessage);

//   const channelId = await notifee.createChannel({
//     id: 'default',
//     name: '알림 채널',
//     sound: 'default',
//     badge: true,
//     importance: AndroidImportance.HIGH,
//     //     importance: AndroidImportance.HIGH,
//   });

//   //   // Display the notification
//   await notifee.displayNotification({
//     title: 'title',
//     body: 'body',
//     android: {
//       channelId,
//       pressAction: {
//         id: 'default',
//       },
//       color: 'red',
//     },
//   });
// };
