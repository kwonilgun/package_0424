/**
 * @ Author: Kwonilgun
 * @ Create Time: 2025-01-14 16:42:49
 * @ Modified by: Your name
 * @ Modified time: 2025-03-11 10:31:59
 * @ Description:
 */



import {AppRegistry, Platform, Linking} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import {onDisplayIosNotification} from './Screen/Chat/notification/notificationServices';
// import AsyncStorage from '@react-native-async-storage/async-storage';


// if(Platform.OS === 'ios'){
//   const messaging = require('@react-native-firebase/messaging').default;
//   const notifee = require('@notifee/react-native').default;
//   const {EventType} = require('@notifee/react-native');
//   console.log('index.js: messaging 초기화');

//   let badgeCount = 0; // 뱃지 카운트 초기화

//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     console.log(' IOS Message handled in the background!!!!!', remoteMessage);

//     await onDisplayIosNotification(remoteMessage);
//   });

//   notifee.onBackgroundEvent(async ({type, detail}) => {
//     const {notification, pressAction} = detail;

//     console.log('index, IOS onBackgroudEvent, type = ', type);
//     // console.log('detail', detail);
//     // Check if the user pressed the "Mark as read" action
//     if (type === EventType.PRESS) {
//       // Update external API
//       console.log('IOS onBackgroundEvent pressed....');

//       // // Remove the notification
//       await notifee.cancelNotification(notification.id);
//       // 앱을 특정 탭으로 열기
//       badgeCount++;
//       await notifee.setBadgeCount(badgeCount);

//       Linking.openURL('myapp://UserMain'); // 'chat'은 특정 탭의 딥 링크
//     }
//     else if(type === EventType.DELIVERED){
//       console.log('IOS onBackgroundEvent delivered');
//       // 알림 데이터를 저장
//       badgeCount = parseInt(await AsyncStorage.getItem('badgeCount') || '0', 10);
//       badgeCount += 1;
//       await AsyncStorage.setItem('badgeCount', badgeCount.toString());
//     }
//   });
// }
// else if (Platform.OS === 'android') {
//   const messaging = require('@react-native-firebase/messaging').default;
//   const notifee = require('@notifee/react-native').default;
//   const {EventType} = require('@notifee/react-native');
//   console.log('index.js: messaging 초기화');

//   let badgeCount = 0; // 뱃지 카운트 초기화

  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   console.log('Message handled in the background!', remoteMessage);

  //   // await onDisplayAndroidNotification(remoteMessage);
  // });

  // notifee.onBackgroundEvent(async ({type, detail}) => {
  //   const {notification, pressAction} = detail;

  //   console.log('index, onBackgroudEvent, type = ', type);
  //   // console.log('detail', detail);
  //   // Check if the user pressed the "Mark as read" action
  //   if (type === EventType.PRESS) {
  //     // Update external API
  //     console.log('onBackgroundEvent pressed....');

  //     // // Remove the notification
  //     await notifee.cancelNotification(notification.id);
  //     // 앱을 특정 탭으로 열기
  //     badgeCount++;
  //     await notifee.setBadgeCount(badgeCount);

  //     Linking.openURL('myapp://UserMain'); // 'chat'은 특정 탭의 딥 링크
  //   }
  //   else if(type === EventType.DELIVERED){
      
  //     // 알림 데이터를 저장
  //     badgeCount = parseInt(await AsyncStorage.getItem('badgeCount') || '0', 10);
  //     badgeCount += 1;
  //     console.log('onBackgroundEvent delivered badgeCount', badgeCount);
  //     await AsyncStorage.setItem('badgeCount', badgeCount.toString());
  //   }
  // });
// }

AppRegistry.registerComponent(appName, () => App);
