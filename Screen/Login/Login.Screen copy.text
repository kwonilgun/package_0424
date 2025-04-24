/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/store/Context.Manager';

import {useForm, SubmitHandler} from 'react-hook-form';
// import {getInfoOfPhoneNumberFromDb} from './useLogin';
import {branchByStatus} from './branchByStatus';

import {UserFormInput} from '../model/interface/IAuthInfo';
import {LoginScreenProps} from '../model/types/TUserNavigator';
import InputField from '../../utils/InputField';
// import {styles} from './Profile';
// import {SocketState} from '../Chat/socketSingleton';
// import {ChatManager, INotification} from '../Chat/chatManager';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import {alertMsg} from '../../utils/alerts/alertMsg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  LanguageContext,
  useLanguage,
} from '../../context/store/LanguageContext';
// import {height} from '../../styles/responsiveSize';
import {Image} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// import SocialLoginButton from './OAuth/SocialLoginButton';
// import {signInWithGoogle} from './OAuth/SocialLogin';
// import GoogleIcon from '../../assets/images/google.png';
import {getInfoOfEmailFromDb} from './useLogin';
import {
  LOGIN_NO_EXIST_EMAIL,
  LOGIN_PASSWORD_ERROR,
} from '../../assets/common/BaseValue';
import CheckBox from '@react-native-community/checkbox';
// import {Checkbox} from 'react-native-paper';
import GlobalStyles from '../../styles/GlobalStyles';
import {
  displayNotification,
  displayNotificationNoParams,
} from '../Chat/notification/displayNotification';
import { getPromiseFcmToken } from '../Chat/notification/services';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  // const [username, setUsername] = useState('');
  const {state, dispatch, notifyDispatch} = useAuth();

  // 2024-05-26 : 자동 로그인 시에 로그인 화면 안 보이게 하기 위해서
  const [loading, setLoading] = useState(true);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [localLanguage, setLocalLanguage] = useState<string>('');
  const {changeLanguage} = useContext(LanguageContext);
  const {language} = useLanguage();
  const [isAutoLogin, setIsAutoLogin] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<UserFormInput>({
    defaultValues: {
      nickName: '',
      password: '',
      ozsId: '',
    },
  });

  /*
  useEffect의 첫 번째 인자는 컴포넌트가 마운트(mount)될 때 실행되는 함수입니다. 두 번째 인자는 의존성 배열이며, 배열에 포함된 값들이 변경될 때만 함수가 재실행됩니다. 빈 배열을 전달하면 컴포넌트가 처음 마운트될 때만 실행되고, 컴포넌트가 언마운트될 때 클린업(clean-up) 함수가 호출됩니다
  */
  useEffect(() => {
    console.log(
      'Login.Screen : useEffect : isAuthenticated  = ',
      state.isAuthenticated,
    );
    if (state.isAuthenticated) {
      /************2024-05-08************************* 
      //💇‍♀️  : 우선 소켓 초기화를 block
      initializeSocket();

      *****************************************/
      updateFcmTokenOnChatUser();

      loginLocalSaveAndGoToProduct();
    }
  }, [state.isAuthenticated]);

  const updateFcmTokenOnChatUser = async () => {
    const userId = state.user?.userId;

    try {
      const token = await getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const fcm = await getPromiseFcmToken();
      console.log('Login.Screen - userId , fcm ', userId, fcm);
      const params = {
        userId: userId,
        fcmToken: fcm,
      };

      const response: AxiosResponse = await axios.post(
        `${baseURL}messages/fcm-update`,
        JSON.stringify(params),
        config,
      );
      console.log('Login.Screen - updateFcmTokenOnChatUser: ', response.data, response.status);
      if(response.status === 200){
        console.log('fcm update 성공 ');
      }
      else if(response.status === 201){
        console.log('fcm 유지 성공 ');
      }


    } catch (error) {
      console.log('updateFcmTokenOnChatUser error', error);
    }

  };

  // 2024-05-26 :Fetch the phone number from AsyncStorage and attempt login
  useFocusEffect(
    useCallback(() => {
      console.log('Login.screen useFocus language = ', language);

      // 2024-11-20 : 한글/영여 toggling 문제 해결
      loginSetLanguage(language);
      // 2024-11-14 : email로 변경

      checkAutoLogin();

      setLoading(false);

      return () => {
        setLoading(true);
      };
    }, []),
  );

  const checkAutoLogin = async () => {
    try {
      const savedAutoLogin = await AsyncStorage.getItem('autoLogin');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPassword = await AsyncStorage.getItem('password');

      if (savedAutoLogin === 'true' && savedEmail && savedPassword) {
        console.log(
          'Login.Screen.tsx  auto login >>> savedEmail, savedPassword = ',
          savedEmail,
          savedPassword,
        );
        onSubmit({
          nickName: savedEmail,
          password: savedPassword,
          ozsId: '',
          phoneNumber: '',
        });
        setLoading(false);
      } else {
        console.log(
          'Login.Screen.tsx 에러 savedEmail, savedPassword ',
          savedEmail,
          savedPassword,
        );
        setLoading(false);
      }
    } catch (error) {
      console.log('Error reading phone number from AsyncStorage:', error);
      setLoading(false);
    }
  };

  const loginSetLanguage = async (value: string) => {
    // const value = await AsyncStorage.getItem('language');
    console.log('Login.screen language value = ', value);

    if (language === 'kr' || value === null) {
      strings.setLanguage('kr');
      // setLocalLanguage('한국어');
      changeLanguage('kr');
      await AsyncStorage.setItem('language', 'kr');
    } else {
      // setLocalLanguage('English');
      strings.setLanguage('en');
      changeLanguage('en');
      await AsyncStorage.setItem('language', 'en');
      // changeLanguage('en');
    }
  };

  const selectLanguage = async () => {
    console.log('select language click');
    if (language === 'en') {
      console.log('현재 언어 == 영어, 한글로 변경');
      setLocalLanguage('한국어');
      changeLanguage('kr');
      // await AsyncStorage.setItem('language', 'kr');
    } else {
      console.log('현재 언어 == 한글, 영어로 변경');
      setLocalLanguage('English');
      changeLanguage('en');
      // await AsyncStorage.setItem('language', 'en');
    }
  };

  // 2024-05-26 : 자동 로그인을 위해서 추가,
  const loginLocalSaveAndGoToProduct = async () => {
    try {
      // console.log('login/loginLocalSaveGoToProduct phoneNumber = ', state.user);
      await AsyncStorage.setItem('phoneNumber', state.user!.phoneNumber);



      // 2024-06-14 : 로그인 후에 home 메뉴로 간다.

      navigation.navigate('Home', {
        screen: 'ProductMainScreen',
      });
    } catch (error) {
      console.log('phoneNumber save to local error = ', error);
    }
  };

  //singleton socket를 초기화 하고 이후에는 singleton을 불러서 사용하면된다.
  //   function initializeSocket() {
  //     const socket = SocketState.getInstance();

  //     socket
  //       .initializeSocket()
  //       .then(res => {
  //         console.log('소켓 초기화 성공', res);
  //         //성공 이후 ping start
  //         socket.startPing();
  //         //    서버에 새로운 사용자를 등록한다.
  //         socket.emit('new-user-add', state.user?.userId!);

  //         // 알림에 대한 콜백함수 세팅한다.
  //         socket.setNotificationCallback(notificationCallback);
  //       })
  //       .catch(err => {
  //         console.log('소켓 초기화 실패', err);
  //       });
  //   }

  // 2024-03-13 : 추가
  //   function notificationCallback(data: INotification) {
  //     console.log('notification call back: data', data);

  //     const chatManager = ChatManager.getInstance();

  //     if (chatManager.isChatBoxOpen(data.senderId)) {
  //       console.log('Login.Screen: notification call back : 채팅창 열림');
  //       const notification = {...data, isRead: true};
  //       chatManager.chatNotification = notification;
  //     } else {
  //       console.log('Login.Screen: notification call back : 채팅창 닫힘');
  //       chatManager.chatNotification = data;
  //     }

  //     //notification을 보낸다. -->
  //     notifyDispatch({type: 'ON'});
  //   }

  /*
  여기서 SubmitHandler는 제네릭 타입 TFieldValues를 받아들이는데, 이는 폼 필드들의 값들을 나타내는 타입입니다.

  이 SubmitHandler는 두 개의 매개변수를 받습니다. 첫 번째 매개변수인 data는 폼 필드들의 값들을 담은 객체로, 이 객체의 타입은 TFieldValues와 일치해야 합니다. 두 번째 매개변수인 event는 React의 합성 이벤트를 나타내며, 선택적으로 전달될 수 있습니다.

  이 함수는 어떤 종류의 값을 반환할 수 있는데, unknown 또는 Promise<unknown> 형태입니다. 이것은 함수가 어떤 값이든 반환할 수 있거나, 비동기 작업을 수행하고 Promise를 반환할 수 있다는 것을 의미합니다.

  이 타입을 사용하면 React 폼에서 제출 핸들러를 정의할 때 사용할 수 있으며, 해당 핸들러 함수는 폼 데이터를 처리하고 필요에 따라 비동기 작업을 수행할 수 있습니다.
  */
  const onSubmit: SubmitHandler<UserFormInput> = async data => {
    // 실제 로그인 로직을 여기에 구현하고, 성공 시 Redux 액션을 디스패치합니다.
    // 예를 들어, 서버 API 호출 및 인증 로직을 수행합니다.

    console.log('onSubmit, dispatch, loggedInUser = ', data);

    const savedAutoLogin = await AsyncStorage.getItem('autoLogin');
    if (
      (isAutoLogin || savedAutoLogin === 'true') &&
      data.nickName &&
      data.password
    ) {
      await AsyncStorage.setItem('autoLogin', 'true');
      await AsyncStorage.setItem('email', data.nickName);
      await AsyncStorage.setItem('password', data.password);
    } else {
      await AsyncStorage.removeItem('autoLogin');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
    }

    //입력 값을 reset 한다.
    // reset();

    getInfoOfEmailFromDb(data)
      .then(element => {
        // console.log(element);
        const message: string =
          element.data.message === null || element.data.message === undefined
            ? 'no'
            : element.data.message;

        const koreanString =
          '디바이스 id가 틀림, 다른 디바이스에서 로그인 진행함';
        const englishString =
          'Device ID is incorrect, logged in from another device';

        if (message.includes(koreanString) && language === 'en') {
          element.data.message = englishString;
        } else {
          console.log('branchByStatus.tsx 메세지 없음');
        }

        branchByStatus({navigation}, element, dispatch);
      })
      .catch(error => {
        // 2024-11-17 : 이메일 로그인 에러 처리, 서버에서 에러를 보내는 경우 send와 json에 따라서 status가 달라진다.

        console.error(error);
        // 2024-11-17: 이메일 로그인 에러 처리 - 서버에서 반환하는 에러에 따라 적절한 상태 처리
        const {status} = error.response?.request || {};

        switch (status) {
          case LOGIN_PASSWORD_ERROR:
            console.log('패스워드 틀림');
            alertMsg(strings.ERROR, strings.PASSWORD_ERROR);
            break;

          case LOGIN_NO_EXIST_EMAIL:
            console.log('해당 이메일 없음');
            alertMsg(strings.ERROR, strings.NO_EXIST_EMAIL);
            break;

          default:
            console.log('알 수 없는 에러 또는 미등록 사용자');
            alertMsg(strings.ERROR, strings.NO_USER_AND_REGISTER_MEMBER);
            break;
        }
      });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordReset = (navigation: any) => {
    console.log('click password reset');
    navigation.navigate('PasswordResetScreen');
  };

  const handleCheckboxChange = async (value: boolean) => {
    console.log('Before state update: isAutoLogin:', value);
    try {
      setIsAutoLogin(value);
      await AsyncStorage.setItem('autoLogin', value ? 'true' : 'false');
      console.log('Checkbox value saved successfully:', value);
    } catch (error) {
      console.error('Error saving checkbox value:', error);
    }
    console.log('After state update: isAutoLogin:', isAutoLogin);
  };

  const onPressCenter = () => {
    console.log('Login.Screen center click');
  };

  const onPressRight = () => {
    console.log('Login.Screen right  click');
    selectLanguage();
  };

  const CenterCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressCenter}>
        <>
          <FontAwesome
            style={{
              color: 'black',
              marginRight: -RFPercentage(20),
              height: RFPercentage(8),
              width: RFPercentage(8),
              fontSize: RFPercentage(6),
            }}
            name="sign-in"
          />
        </>
      </TouchableOpacity>
    );
  };

  const RightCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressRight}>
        <>
          <FontAwesome
            style={{
              color: 'black',
              marginRight: -RFPercentage(2),
              height: RFPercentage(8),
              width: RFPercentage(8),
              fontSize: RFPercentage(5),
              fontWeight: 'bold',
            }}
            name="language"
          />
        </>
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        isCenterView={true}
        // centerText={strings.HOME}
        centerCustomView={CenterCustomComponent}
        // rightText={''}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
        isRightView={true}
        rightCustomView={RightCustomComponent}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        {loading ? (
          <>
            <LoadingWheel />
          </>
        ) : (
          <ScrollView style={GlobalStyles.scrollView}>
            <View style={GlobalStyles.VStack}>
              <View style={GlobalStyles.HStack_LOGO}>
                <View>
                  {/* 로고 이미지 삽입 */}
                  <Image
                    source={require('../../assets/images/package_002.png')} // 로컬 이미지 경로 사용
                    style={GlobalStyles.logo} // 스타일을 통해 크기 조정
                    resizeMode="contain" // 이미지가 영역에 맞게 조정되도록 설정
                  />
                </View>
              </View>

              <Text style={GlobalStyles.inputTitle}>{strings.EMAIL}</Text>
              <View style={GlobalStyles.HStack}>
                <InputField
                  control={control}
                  rules={{
                    required: true,
                    minLength: 5,
                    // maxLength: 11,
                    pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  }}
                  name="nickName"
                  placeholder={strings.PLEASE_ENTER_EMAIL}
                  keyboard="email-address" // 숫자 판으로 변경
                  // isEditable={false}
                />
                {errors.nickName && (
                  <Text style={GlobalStyles.errorMessage}>
                    {strings.EMAIL} {strings.ERROR}
                  </Text>
                )}
              </View>

              <Text style={GlobalStyles.inputTitle}>
                {strings.PASSWORD_NUMBER}
              </Text>
              <View style={GlobalStyles.HStack}>
                <InputField
                  control={control}
                  rules={{
                    required: true,
                    minLength: 5,
                    maxLength: 20,
                  }}
                  name="password"
                  placeholder={strings.PLEASE_ENTER_PWD}
                  keyboard="default" // 숫자 판으로 변경
                  isPassword={!passwordVisible}
                  // isEditable={false}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={[GlobalStyles.icon]}>
                  <Icon
                    name={passwordVisible ? 'eyeo' : 'eye'}
                    size={RFPercentage(4)}
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              <View>
                {errors.password && (
                  <Text style={GlobalStyles.errorMessage}>
                    {strings.PASSWORD_NUMBER} {strings.ERROR}
                  </Text>
                )}
              </View>

              <View style={GlobalStyles.HStack_PASSWORD}>
                <Text
                  style={GlobalStyles.passwordText}
                  onPress={() => {
                    handlePasswordReset(navigation);
                  }}>
                  {strings.PASSWORD_FORGET}
                </Text>
              </View>

              <View style={GlobalStyles.checkboxContainer}>
                <TouchableOpacity
                  style={{
                    height: 24,
                    width: 24,
                    borderWidth: 1,
                    borderColor: 'black',
                    backgroundColor: isAutoLogin
                      ? 'transparent'
                      : 'transparent',
                  }}
                  onPress={() => handleCheckboxChange(!isAutoLogin)}>
                  {isAutoLogin && (
                    <Text
                      style={{
                        textAlign: 'center',
                        color: Platform.OS === 'ios' ? 'white' : 'black',
                      }}>
                      ✔
                    </Text>
                  )}
                </TouchableOpacity>

                <Text style={GlobalStyles.checkboxLabel}>
                  {strings.AUTO_LOGIN}
                </Text>
              </View>

              <View style={GlobalStyles.HStack_LOGIN}>
                <TouchableOpacity
                  onPress={handleSubmit(data => onSubmit(data))}>
                  <Text
                    style={{
                      height: RFPercentage(8),
                      width: RFPercentage(10),
                      color: 'black',
                      textDecorationLine: 'underline',
                      fontSize: RFPercentage(2.5),
                      fontWeight: 'bold',
                    }}>
                    {strings.LOGIN}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('MembershipScreen');
                    console.log('회원가입 click');
                    // displayNotificationNoParams();
                  }}>
                  <Text
                    style={{
                      height: RFPercentage(8),
                      width: RFPercentage(15),
                      color: 'black',
                      textDecorationLine: 'underline',
                      fontSize: RFPercentage(2.5),
                      fontWeight: 'bold',
                      marginLeft: RFPercentage(10),
                    }}>
                    {strings.MEMBERSHIP}
                  </Text>
                </TouchableOpacity>

                
              </View>
              <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('NaverLoginScreen');
                    console.log('네이버 로그인 click');
                    // displayNotificationNoParams();
                  }}>
                  <Text
                    style={{
                      height: RFPercentage(8),
                      width: RFPercentage(15),
                      color: 'black',
                      textDecorationLine: 'underline',
                      fontSize: RFPercentage(2.5),
                      fontWeight: 'bold',
                      marginLeft: RFPercentage(10),
                    }}>
                    네이버 로그인
                  </Text>
                </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default LoginScreen;
