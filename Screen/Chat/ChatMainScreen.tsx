/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  AppState,
  Platform
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../styles/colors';
import isEmpty from '../../utils/isEmpty';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { ChatMainScreenProps } from '../model/types/TUserNavigator';
import { useAuth } from '../../context/store/Context.Manager';
import { ISocket } from '../model/interface/ISocket';
import { io, Socket } from 'socket.io-client';
import { baseURL, socketURL } from '../../assets/common/BaseUrl';
// import DeviceInfo from 'react-native-device-info';
import { SocketItem } from '../../Redux/Cart/Reducers/socketItems';
import { connect } from 'react-redux';
import * as actions from '../../Redux/Cart/Actions/socketActions';
import { useFocusEffect } from '@react-navigation/native';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { IUserAtDB } from '../model/interface/IAuthInfo';
import { alertMsg } from '../../utils/alerts/alertMsg';
import strings from '../../constants/lang';
import {
  height, width
} from '../../assets/common/BaseValue';
import RoundImage from '../../utils/basicForm/RoundImage';
import { useRoute } from '@react-navigation/native';

// import {IMessage} from '../model/interface/IMessage';
// import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import { IMessage } from './GiftedChat/Models';
import GiftedChat, { GiftedChatAppend } from './GiftedChat/GiftedChat';
import { ImageBackground } from 'react-native';
import imagePath from './GiftedChat/assets/constatns/imagePath';
import GlobalStyles from '../../styles/GlobalStyles';
import { InputToolbar } from './GiftedChat/InputToolbar';
import { IChatUserInfo } from './ChatRegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';


const ChatMainScreen: React.FC<ChatMainScreenProps> = props => {
  const {badgeCountState, badgeCountDispatch} = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const {state, socketState, socketDispatch} = useAuth();
  const [managers, setManagers] = useState<IUserAtDB | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const [activeChatUsers, setActiveChatUsers] = useState<any[]>([]); // For user list
  const [chatUsers, setChatUsers] = useState<IChatUserInfo[] | null>(null);
  // const [showChat, setShowChat] = useState<boolean>(false); // To toggle between user list and chat

  const [selectedUser, setSelectedUser] = useState<IChatUserInfo | null>(null);
  const [badge, setBadgeCount] = useState<number>(0);
  const [sentName, setSentName] = useState<string>('');

  const showChat = useRef<boolean>(false);


  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatRoomIdRef = useRef<string | null>(null);

  const appState = useRef<string>(AppState.currentState);

  const route = useRoute();

  const isScreenFocused = useRef<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      if (AppState.currentState !== 'active') {
        console.log('앱이 포그라운드 상태가 아님, useFocusEffect 실행 안 함');
        return;
      }


      if (isEmpty(socketState.socketId)) {
        console.log('현재 화면 이름:', route.name);
        console.log('useFocusEffect ... 소켓 비어있음');
        fetchDataFromNotifee();
        fetchChatUsers();
        activateSocket();
      } else {
        console.log('ChatMainScreen: 이미 소켓이 있음');
      }

      return () => {
        console.log('ChatMainScreen: useEffect : exit 한다.');
        // 2025-03-10 화면을 빠져 나가면 바로 해제를 한다. 
        // stopPingSend(socketState.socketId);
        setLoading(true);
      };
    }, [socketState.socketId])
  );

  // // 2025-03-06 20:25:02, 다른 화면으로 변경이 된 경우 badge count를 보여준다.
  // useFocusEffect(
  //   useCallback(() => {
  //     const currentRouteName = route.name;

  //     console.log('Screen is focused:', currentRouteName);
  //     isScreenFocused.current = true;

  //     if(badgeCountState.isBadgeCount !== 0) {
  //       badgeCountDispatch({type: 'reset'});
  //     }

  //     return () => {
  //       isScreenFocused.current = false;
  //       console.log('Screen is unfocused:', currentRouteName);
  //     };
  //   }, [route.name])
  // );



  // 2025-03-03 17:56:16: 앱 exit를 감지하고 
  // useEffect(() => {

  //   const handleAppStateChange = (nextAppState: string) => {

  //     if (
  //       appState.current.match(/active/) &&
  //       nextAppState.match(/inactive|background/) &&
  //       socketState.socketId
  //     ) {
  //       console.log('handleAppStateChange socketState.sockedId', socketState.socketId);

  //       if(isEmpty(socketState.socketId)){
  //         console.log('handleAppStateChange sockeId가 비어있음');
  //         return;
  //       }
  //       else{
  //         console.log('ChatMainScreen - 앱이 백그라운드로 이동하거나 종료됨');
  //         stopPingSend(socketState.socketId);
  //       }
  //     }
  //     appState.current = nextAppState;
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);

  //   return () => {
  //     console.log('ChatMainScreen handleAppStateChange remove ');
  //     subscription.remove();
  //   };
  // }, []);

  const fetchDataFromNotifee = async () => {
    console.log('ChatMainScreen - fetchDataFromNotifee');
    try {

      const count = badgeCountState.isBadgeCount;
      const name = await AsyncStorage.getItem('chatFromWho');
      console.log('ChatMainScreen.tsx fetchDataFromNotifee badgeCount = ', count);
      console.log('ChatMain.tsx fetchDataFromNotifee name = ', name);


      setBadgeCount(count);
      setSentName(name!);


    } catch (error) {
      console.log('fetchBadgeCount error', error);
    }

  };

  useFocusEffect(
        useCallback(() => {

      console.log('ChatMainScreen - BadgeCountState count =', badgeCountState.isBadgeCount );
      setBadgeCount(badgeCountState.isBadgeCount);

      // const saveBadgeCountIntoLocal = async ()  =>{
      //   console.log('ChatMainScreen - saveBadgeCountIntoLocal');
      //   await AsyncStorage.setItem('badgeCount', String(badgeCountState.isBadgeCount));
      // };

      // saveBadgeCountIntoLocal();

      return () => {
          console.log('ChatMainScreen - badge count exit');
      };
    }, [badgeCountState]),
  );

  // 서버에서 메시지 불러오기
  const fetchChatUsers = async () => {
    console.log('fetchChatUsers');
    try {
      const token = await getToken();
      //헤드 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const response: AxiosResponse = await axios.get(
        `${baseURL}messages/chatList`,
        config,
      );
      if (response.status === 200) {
        // console.log('Manager data = ', response.data);
        const chatUser = response.data.filter((item: IChatUserInfo) => {
          console.log('ChatMainScreen item.email = ', item.email);
          if(state.user?.email?.includes('Manager')){
            return item.email !== state.user?.email;
          }
          else{
            return item.email !== state.user?.email && item.email.includes('Manager');
          }

        });

        console.log('ChatMainScreen-fetchChatUsers : chatUser', chatUser);
        setChatUsers(chatUser);

        setLoading(false);
      }
    } catch (error) {
      alertMsg(strings.ERROR, '매니저 데이타 다운로드 실패');
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const token = await getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        params: {chatRoomId: roomId},
      };
      const response = await axios.get(
        `${baseURL}messages/`,

        // JSON.stringify({chatRoomId: roomId}),
        config,
      );

      // console.log('fetchMessages:  response.data = ', response.data);
      if (!isEmpty(response.data)) {
        const formattedMessages = response.data
          .map((item: any) => ({
            _id: item.messageId,
            text: item.text,
            createdAt: new Date(item.createdAt),
            user: item.user,
          }))
          .sort((a: any, b: any) => b.createdAt - a.createdAt); // createdAt 기준 오름차순 정렬

        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally{

      // !!!!!!2025-03-10, 나머지 처리를 완료하고 마지막에 채팅창을 열도록 수정함.
      showChat.current = true;
    }
  };

  const onSend = useCallback(
    async (messages = []) => {
      console.log('onSend messages ', messages);
      if (socketState.socketId) {
        try {
          const token = await getToken();
          const config = {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${token}`,
            },
          };

          const newMessage = messages.map((item: IMessage) => {
            return {
              chatRoomId: chatRoomIdRef.current,
              createdAt: item.createdAt.toString(),
              messageId: item._id,
              text: item.text,
              user: item.user,
            };
          });

          // console.log('onSend newMessage = ', newMessage[0]);

          await axios.post(
            `${baseURL}messages`,
            JSON.stringify(newMessage[0]),
            config,
          );

          socketState.socketId.emit('send-message', ...messages);
          setMessages(previousMessages =>
            GiftedChatAppend(previousMessages, messages),
          );

          // console.log('response = ', response);
        } catch (error) {}
      }
    },
    [socketState.socketId],
  );


  async function activateSocket() {
    console.log('activateSocket...');

    const socket: Socket = io(socketURL); // 서버 주소를 입력하세요

    socketDispatch({type: 'SET_SOCKET_ID', socketId: socket});

    // 초기 변수 설정
    const socketData: ISocket = {
      id: '', // 서버 연결 후 할당
      socketId: socket,
      pingInterval: null, // 예: 5초
      pongInterval: null, // 예: 5초
    };

    // props.addToSocket({socket: socketData});

    // 서버와의 연결 이벤트 처리
    socket.on('connect', () => {
      socketData.id = socket.id!; // 연결된 소켓 ID 할당
      console.log('Connected to server:', socketData);
    });

    // 2025-03-06 13:45:26, ping은 setInterval로 25초마다 한번씩 보내고, pong은 5초 안에 응답이 오도록 setTimeout() 을 적용을 했다.
    socketData.pingInterval = pingInterval.current = setInterval(() => {
      // console.log('activateSocket : ping을 보낸다.', state.user?.userId);
      socket.emit('ping', '핑을 보냅니다: from ' + state.user?.userId);

      socketData.pongInterval = pongInterval.current = setTimeout(() => {
        if(Platform.OS === 'ios'){
          console.log('ios - 시간 내에 pong을 받지 못했다.');
        }
        else{
          console.log('android - 시간 내에 pong을 받지 못함');
        }

        handleSocketTimeout(socketData); // 소켓 타임아웃 처리 함수 호출 // 특정 시간 내에 pong을 받지 못하면

        // props.addToSocket({socket: socketData});
      }, 5000); //     }, PONG_TIMEOUT); //5초
    }, 25000); // 25초  // }, PING_INTERVAL); // 20초

    // 2023-09-17 : pong을 받으면 세팅된 pongInterval.current에 해당되는 setTimeout을 해제한다. 10초 간의 모니터링을 통해서 연결이 살아있는 지 확인을 한다.
    socket.on('ping', res => {
      // console.log(' ping을 받음 = ', res);
      if (!isEmpty(socketData.pingInterval)) {
        clearTimeout(socketData.pongInterval!);
        // socketData.pongInterval = null;
      }
    });

    //2025-01-02 : 나 자신을 새로운 유저에 등록한다. 그러면 get-users 가 날라온다.
    socket.emit('new-user-add', state.user);

    // 서버로부터 메시지 수신 예제
    socket.on('receive-message', (data: any) => {
      console.log('Message from server:', data);
      setMessages(prevMessages => GiftedChatAppend(prevMessages, [data]));

      console.log('ChatMainScreen receive-message - else', showChat.current, route.name, isScreenFocused.current);

      // 2025-03-06 20:27:58, 다른 screen에 있는 경우 , chat message가 온 경우 뱃지를 표시한다. 
      if(showChat.current && !isScreenFocused.current){
        console.log('ChatMainScreen receive-message - 채팅창 오픈 이면서 ChatMainScreen이 아닌 경우');
        badgeCountDispatch({type: 'increment'});
      }
      else if(showChat.current && isScreenFocused.current){
        console.log('ChatMainScreen receive-message - 채팅창 오픈 이면서 ChatMainScreen인 경우');
      } else{
        console.log('ChatMainScreen receive-message - else', showChat.current, route.name);
      }
    });

    // if (state.user?.userId! !== MANAGER_ID) {
    socket.on('get-users', users => {
      console.log('socketTurnOn:소켓으로 get-users 받음= ', users);

    });
    // }

    // 연결 종료 이벤트 처리
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
}

let retryCount = 0; // 재시도 횟수

function handleSocketTimeout(socketData: ISocket) {
  console.log('ChatMainScreen - 소켓 타임아웃 발생, 재연결 시도...');
  retryCount++;

  if (retryCount <= 1) { // 최대 3번 재시도
    console.log(`ChatMainScreen - 재시도 ${retryCount}번째...`);
    stopPingSend(socketData.socketId);
    alertMsg('에러', '채팅 연결 실패, 다시 시도 해주세요');
    // socketData.socketId.disconnect(); // 기존 소켓 연결 종료

    // setTimeout(activateSocket, 2000 * retryCount); // 지수 백오프 적용
  } else {
    console.log('ChatMainScreen - 재시도 실패, 사용자에게 알림');
    alertMsg('에러', '채팅 연결 시도 실패');
    stopPingSend(socketData.socketId);
    // 사용자에게 네트워크 문제 알림 또는 로그아웃 처리
    // retryCount = 0; // 재시도 횟수 초기화ㅁ
  }
}


  const makeRoomId = (item: IChatUserInfo): string => {
    return [state.user?.email!.split('@')[0], item.email!.split('@')[0]]
      .sort()
      .join('-');
  };

  const startChat = (item: IChatUserInfo) => {
    if (socketState.socketId) {
      const roomId = makeRoomId(item);
      console.log('roomId = ', roomId);
      chatRoomIdRef.current = roomId;

      socketState.socketId.emit('chat-opened', {
        chatRoomId: roomId,
        userId: state.user?.userId,
      });

      setChatRoomId(roomId);
      setSelectedUser(item);

      //2025-01-10 : 서버에서 저장된 메세지를 가져온다.
      fetchMessages(roomId);

    } else {
      console.log('socketState.socketId is empty');
    }
  };

  // 알림 취소 함수
  const cancelNotifications = async () => {
    try {
        // 현재 표시 중인 알림 가져오기
        // 표시 중인 알림이 있으면 취소
        await AsyncStorage.removeItem('badgeCount');
        await notifee.cancelAllNotifications(); // 모든 알림 취소
        // 앱 아이콘 뱃지 초기화
        await notifee.setBadgeCount(0);
        console.log('All notifications canceled');
        badgeCountDispatch({type: 'reset'});
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  };

  const renderUserList = () => (
    <View style={styles.userListContainer}>
      <Text style={styles.title}>대화 리스트</Text>
      <FlatList
        data={chatUsers}
        keyExtractor={item => item.email}
        renderItem={({item}) => {
          const userName = item.email.split('@')[0];
          console.log('renderUserList userName, sentName', userName, sentName );
          const showBadge = userName === sentName && badge > 0;
          // const showBadge =  badge > 0;
          console.log('renderUserList userName, sentName, showBadge', userName, sentName, showBadge);
          return (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                if(showBadge){
                  setBadgeCount(0);
                  cancelNotifications();
                }
                // activateSocket();
                startChat(item);

              }} // Navigate to chat when a user is selected
            >
              {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
              <View >
                <Text style={styles.userName}>{userName}</Text>
                {showBadge && (
                  <View style={styles.badge}>
                    {/* <Text style={styles.badgeText}>{badge}</Text> */}
                    <Text>{badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}> 리스트 없음.</Text>
        }
      />
    </View>
  );

  const renderChat = () => (
    <ImageBackground
      source={imagePath.icBigLight}
      style={{
        flex: 1,
        marginTop: RFPercentage(1),
        height: 'auto',
      }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        renderInputToolbar={renderInputToolbar}
        user={{
          _id: selectedUser?.userId!,
          name: state.user?.email!.split('@')[0],
        }}
      />
    </ImageBackground>
  );

  const stopPingSend = (sockeId: any) => {
    // console.log('ChatMainScreen: stopPingSend.... socketId', sockeId);
    if (sockeId) {
      console.log('stopPingSend sockId 가 존재')
      sockeId.emit('chat-closed', {
        chatRoomId: chatRoomIdRef.current,
        userId: state.user?.userId,
      });

      // 소켓 연결 종료
      console.log('Socket disconnected.');
      sockeId.disconnect();

      console.log('props.socket = ', props.socketItem);
      socketDispatch({type: 'RESET'});
      // props.clearSocket();
      // showChat.current = false;
    }

    //pingInterval 및 pongInterval 정리
    if (pingInterval.current) {
      console.log('pingInterval 을 중단한다.');
      clearInterval(pingInterval.current);
    }
    if (pongInterval.current) {
      console.log('pongInterval 을 중단한다.');
      clearTimeout(pongInterval.current);
    }

  };

  const onPressLeft = () => {
    stopPingSend(socketState.socketId);
    props.navigation.navigate('UserMain', {screen: 'ProfileScreen'});
  };

  const LeftCustomComponent = () => {
    return (
      <View style={styles.listContainer}>
        <TouchableOpacity onPress={onPressLeft}>
          <FontAwesome
            style={{
              // height: RFPercentage(8),
              // width: RFPercentage(10),
              marginHorizontal: RFPercentage(1),
              color: colors.black,
              fontSize: RFPercentage(5),
              fontWeight: 'bold',
              // transform: [{scaleX: 1.5}], // 폭을 1.5배 넓힘
            }}
            name="arrow-left"
          />
        </TouchableOpacity>
        <RoundImage
          size={RFPercentage(4)}
          image={require('../../assets/images/ozs_logo.png')}
          isStatic={true}
        />
        <Text style={{marginHorizontal: RFPercentage(1)}}>
          {state.user?.email!.split('@')[0]}
        </Text>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.primaryToolbar}
      />
    );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="채팅"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />
      <>
        {loading ? (
          <LoadingWheel />
        ) : (
          <View style={GlobalStyles.VStack}>
            <>
              {loading ? (
                <LoadingWheel />
              ) : showChat.current ? (
                renderChat()
              ) : (
                renderUserList()
              )}
            </>
          </View>
        )}
      </>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  inputToolbar: {
    marginTop: RFPercentage(0.5),
    height: RFPercentage(5),
    backgroundColor: '#f0f0f0', // 배경색 변경
    borderWidth: 1,
    borderRadius: RFPercentage(1),
    // ㅇborderColor: 'blue', // 테두리 색상 변경
    // padding: RFPercentage(0.5),
  },
  primaryToolbar: {
    alignItems: 'center',
  },
  headerContainer: {
    padding: 10,
  },
  listContainer: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.06,
    // margin: RFPercentage(1),
    // padding: RFPercentage(2),
    // borderWidth: 2,
    // borderRadius: 10,
    // borderColor: 'red',
    // backgroundColor: 'white',
  },
  userListContainer: {
    padding: 10,
  },
  
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  itemContainer: {
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  iconWrapper: {
      position: 'relative',
    },
  userItem: {
    padding: 10,
    marginBottom: 5,
    width: width * 0.8,
    backgroundColor: colors.grey,
    borderRadius: 5,
  },
  userName: {
    fontSize: 16,
    width: width * 0.5,
    color: colors.black,
  },
    // 기존 스타일들...
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    //     changeSocket: (item: any) =>
    //       dispatch(actions.changeSocket({item:SocketItem})),
    clearSocket: () => dispatch(actions.clearSocket()),
    removeFromSocket: () =>
      dispatch(actions.removeFromSocket({socket: undefined})),
    addToSocket: (item: SocketItem) => dispatch(actions.addToSocket(item)),
  };
};

// export default ChatMainScreen;
const mapStateToProps = (state: any) => {
  const {socketItem} = state;
  return {
    socketItem,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatMainScreen);
