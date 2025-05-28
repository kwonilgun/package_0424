/* eslint-disable react-hooks/exhaustive-deps */


import {useEffect, useState} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from './context/store/Context.Manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {EventType} from '@notifee/react-native';



const StartNotify: React.FC = () => {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const { badgeCountDispatch} = useAuth();

    useEffect(() => {

        // 백그라운드에서 메시지를 받을 때 저장
        console.log('StartNotify - ----');

        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
              if (appState.match(/inactive|background/) && nextAppState === 'active') {
                console.log('StartNotify 앱이 백그라운드에서 포그라운드로 전환되었습니다.');
                if(Platform.OS === 'android'){
                  checkBackgroundUpdate();
                }
                if(Platform.OS === 'ios'){
                  // ✅ iOS는 FCM의 데이터 메시지를 활용하여 배지 카운트 증가
                  messaging()
                  .getInitialNotification()
                  .then(remoteMessage => {
                    if (remoteMessage) {
                      console.log('StartNotify handleAppStateChange-ios, remoteMessage', remoteMessage);
                      badgeCountDispatch({ type: 'increment' });
                    } else {
                      console.log('StartNotify handleAppStateChange-ios, remoteMessage 없음');
                      // checkBackgroundUpdate();
                    }
                  });


                }
              }
              setAppState(nextAppState);
          };

         fetchNotifeeOnAppOpen();


        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
          subscription.remove();
        //   unsubscribe();
        };
    }, []);


    // 2025-03-10  ios에서 앱에 알림 뱃지가 있는 경우 앱을 click 한 경우 처리
    const fetchNotifeeOnAppOpen = async ()=>{
        // 표시된 알림 가져오기, ios 앱을 click 한 경우 
        const notifications = await notifee.getDisplayedNotifications();
        console.log('StartNotify - getDisplayedNotification:', notifications);
        if(notifications.length > 0){
          const element = notifications[0];
          if(element.notification.title === 'Package'){
            badgeCountDispatch({ type: 'increment' });
          } else{
            console.log('fetchNotifeeOnAppOpen 제목이 Package가 아니다. 제목 =',element.notification.title);
          }
        }
    };

    useEffect(() => {

      // 앱이 종료된 상태에서 푸시 알림을 통해 열렸을 경우 처리
        messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('앱이 종료된 상태에서 getInitialNotification:', remoteMessage);
                if(remoteMessage.data?.name === '패키지 마켓 알림'){
                    console.log('StartNotify - 앱이 종료 상태에서 패키지 마켓 알림 도착');
                } else {
                  badgeCountDispatch({ type: 'increment' });
                }
                
            }
        });

        // 앱이 백그라운드 상태에서 푸시 알림을 통해 열렸을 경우 처리
        const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
          if (remoteMessage) {
            console.log('앱이 백그라운드에서 onNotificatioOpenedApp.', remoteMessage);
            badgeCountDispatch({ type: 'increment' });
          }
        });

        // 2025-03-10 11:38:54
        const subscription = notifee.onForegroundEvent(({type, detail}) => {
          console.log('StartNotify MainTab type = ', type, detail);
          if (type === EventType.DELIVERED) {
            if(detail.notification?.title === '패키지 마켓 알림'){
              console.log('패키지 마켓 알림 도착, badge는 증가시키지 않는다.');
            } else{
              badgeCountDispatch({type: 'increment'});
            }
          }
        });


        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('Message handled in the background!', remoteMessage);
        });

        return () => {
          unsubscribe();
          subscription();
        } 
      }, []);


  const checkBackgroundUpdate = async () => {
    // 예: 백엔드와 통신하거나 상태를 확인하는 로직
    // setStatus("백그라운드에서 상태 변경을 감지했습니다!");
    const count = parseInt(await AsyncStorage.getItem('badgeCount') || '0', 10);

    console.log('StartNotify count = ', count);
    badgeCountDispatch({'type':'increment'});
  };


  return null;
};

export default StartNotify;
