import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFcmToken } from './services';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status: authStatus', authStatus);
    getFcmToken();
  } else {
    console.error('getToken 진입 실패');
  }
}


export async function onDisplayAndroidNotification(
  item: FirebaseMessagingTypes.RemoteMessage,
) {

  console.log('onDisplayAndroidNotification data ', item);

  if(item?.data){
    const bodyString = item.data;
    console.log('notificationServices - messageData', bodyString);

    let messageData;

    if (typeof bodyString === 'string') {
        // bodyString이 문자열이면 JSON 파싱
        messageData = JSON.parse(bodyString);
    } else {
        // bodyString이 이미 객체면 그대로 사용
        messageData = bodyString;
    }

    // 2025-03-04 13:45:51, messageData = {name:'kwonilgun', text:'hello'}로 구성이 되어 있다.
    console.log('notificationServives - name', messageData.name);
    await AsyncStorage.setItem('chatFromWho', messageData.name);

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: '1',
      name: '패키지',
      sound: 'default',
      importance: AndroidImportance.HIGH,
    });

    if (item.notification) {
      await notifee.displayNotification({
        title: item.notification?.title!.toString(),
        body: item.notification?.body!,
        android: {
          channelId,
          color: 'red',
        },
      });
    }


  }
}




export async function onIosDisplayNotification(
  item: FirebaseMessagingTypes.RemoteMessage,
) {

  console.log('onIosDisplayNotification data ', item);

  if(item.data){
    const dataString = item.data;
    console.log('onIosDisplayNotification - messageData', dataString);

    let messageData;

    if (typeof dataString === 'string') {
        // bodyString이 문자열이면 JSON 파싱
        messageData = JSON.parse(dataString);
    } else {
        // bodyString이 이미 객체면 그대로 사용
        messageData = dataString;
    }

    // 2025-03-04 13:45:51, messageData = {name:'kwonilgun', text:'hello'}로 구성이 되어 있다.
    console.log('onIosDisplayNotification - name', messageData.name);
    await AsyncStorage.setItem('chatFromWho', messageData.name);


    const title = item.notification?.title;
    const contents = item.notification?.body;
    console.log('notificationServices - ios - title ', title);

    await notifee.displayNotification({
        title: title,
        body: contents,
      });


  }
}


export async function notificationListeners() {

  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
    if(Platform.OS === 'android'){
      console.log('android notificationListeners....');
      onDisplayAndroidNotification(remoteMessage);
    } else {
      console.log('ios notificationListeners....');
      onIosDisplayNotification(remoteMessage);
    }
  });

}
