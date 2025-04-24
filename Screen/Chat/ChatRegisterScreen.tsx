/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';
import strings from '../../constants/lang';
import { useAuth } from '../../context/store/Context.Manager';
import { useFocusEffect } from '@react-navigation/native';
import { IUserAtDB } from '../model/interface/IAuthInfo';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import GlobalStyles from '../../styles/GlobalStyles';
import { width } from '../../assets/common/BaseValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import InputField from '../../utils/InputField';
import isEmpty from '../../utils/isEmpty';
import { errorAlert } from '../../utils/alerts/errorAlert';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ChatRegisterScreenProps } from '../model/types/TUserNavigator';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ChatRegisterScreen: React.FC<ChatRegisterScreenProps> = props => {
  const {state, dispatch} = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatUser, setChatUser] = useState<IChatUserInfo | null>(null);
  const [userProfile, setUserProfile] = useState<IUserAtDB | null>(null);



  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<IChatUserInfo>({
    defaultValues: {
      userId: '',
      phone: '',
      nickName: '',
      email: '',
      groupName: '', //APT 이름
      isManager: false,
      fcmToken: '',
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log(
        'ChatRegisterScreen: useFocusEffect : isAuthenticated = ',
        state.isAuthenticated,
      );

      setIsLogin(true);
      existChatUserInfo();
      //  makeChatUserInfo();

      return () => {
        //    reset();
        setUserProfile(null);
      };
    }, []),
  );

  const existChatUserInfo = async () => {
    const token = await getToken();
    //헤드 정보를 만든다.
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      params: {email: state.user?.nickName},
    };
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}messages/user`,
        config,
      );
      if (response.status === 200) {
        reset(response.data);
        setChatUser(response.data);
      } else {
        alertMsg(strings.ERROR, '사용자 정보 없음');
      }
    } catch (error) {
      console.log('ProfileScreen get user error = ', error);
      alertMsg(strings.ERROR, '사용자 정보 가져오지 못함...');
    }
  };


  const isVacancy = () => {
    const currentValues = getValues();
    // 여기에서 변경 여부를 확인하고 필요한 로직을 수행
    console.log('currentValues = ', currentValues);

    const isVacant: boolean = isEmpty(currentValues.groupName);

    console.log('isVacant = ', isVacant);
    return isVacant;
  };

  const confirmUpload: SubmitHandler<IChatUserInfo> = async data => {
    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '채팅 등록',
      func: async (in_data: IChatUserInfo) => {
        console.log('업로드 사용자 주소 data = ', in_data);
        const token = await getToken();

        //헤드 정보를 만든다.
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };
        //2023-02-16 : await 로 변경함. 그리고 에러 발생 처리
        try {
          const response: AxiosResponse = await axios.post(
            `${baseURL}messages/register`,
            JSON.stringify(data),
            config,
          );
          if (response.status === 200 || response.status === 201) {
            alertMsg(strings.SUCCESS, strings.UPLOAD_SUCCESS);
          }
        } catch (error) {
          alertMsg(strings.ERROR, strings.UPLOAD_FAIL);
        }
      },
      params: [data],
    };

    confirmAlert(param);
  };

  const uploadChatUserInfo = () => {
    console.log('채팅 사용자 정보 업로드');
    if (!isVacancy()) {
      console.log('데이타가 변경되었습니다. ');
      //  const currentValues = getValues();
      //  if (!areJsonEqual(currentValues, userOriginalInfo.current!)) {
      handleSubmit(confirmUpload)();
      //  } else {
      //    errorAlert(strings.ERROR, strings.NO_CHANGE_DATA);
      //  }
    } else {
      errorAlert(strings.ERROR, strings.VACANT_DATA);
    }
  };

  const deleteChatUserInfo = async () => {
    console.log('deleteChatUserInfo');
    const param: ConfirmAlertParams = {
      title: strings.DELETE,
      message: '채팅 사용자 삭제',
      func: async () => {
        const token = await getToken();

        //헤드 정보를 만든다.
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
          params: {email: state.user?.nickName},
        };
        //2023-02-16 : await 로 변경함. 그리고 에러 발생 처리
        try {
          const response: AxiosResponse = await axios.delete(
            `${baseURL}messages`,
            config,
          );
          if (response.status === 200 || response.status === 201) {
            alertMsg(strings.DELETE, strings.SUCCESS);
            setChatUser(null);
          }
        } catch (error) {
          alertMsg(strings.ERROR, strings.UPLOAD_FAIL);
        }
      },
      params: [],
    };

    confirmAlert(param);
  };

  const onPressLeft = () => {
    props.navigation.navigate('UserMain', {screen: 'ProfileScreen'});
  };

  const LeftCustomComponent = () => {
    return (
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
    );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={'채팅 등록'}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />

      {loading ? (
        <>
          <LoadingWheel />
        </>
      ) : (
        <>
          {isEmpty(chatUser) ? (
            <View style={{alignItems: 'center', marginTop: 10}}>
              <View style={{margin: RFPercentage(2), alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={async () => {
                    console.log('ChatRegister: 등록필요. ');
                    const fcmToken = await AsyncStorage.getItem('fcmToken');
                    const info: IChatUserInfo = {
                      userId: state.user?.userId!,
                      phone: state.user?.phoneNumber!,
                      nickName: state.user?.nickName!,
                      email: state.user?.nickName!,
                      isManager: false,
                      groupName: '',
                      fcmToken: fcmToken!,
                    };

                    setChatUser(info);
                    reset(info);
                  }}>
                  <View style={GlobalStyles.buttonSmall}>
                    <Text style={{fontSize: RFPercentage(3)}}> + </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={GlobalStyles.containerKey}>
              <ScrollView
                style={GlobalStyles.scrollView}
                keyboardShouldPersistTaps="handled">
                <View style={GlobalStyles.VStack}>
                  <View style={styles.HStackTitle}>
                    {/* <Text style={styles.HeadTitleText}>채팅정보</Text> */}

                    <TouchableOpacity
                      onPress={() => {
                        uploadChatUserInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.REGISTER}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        deleteChatUserInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.DELETE}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.UserInfoBorderBox}>
                    <Text style={[GlobalStyles.inputTitle]}>
                      {strings.EMAIL}
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 2,
                        }}
                        name="email"
                        placeholder={strings.PLEASE_ENTER_NAME}
                        keyboard="name-phone-pad" // 숫자 판으로 변경
                        isEditable={false}
                      />
                      {errors.email && (
                        <Text style={GlobalStyles.errorMessage}>
                          {strings.EMAIL} {strings.ERROR}
                        </Text>
                      )}
                    </View>
                    <Text style={GlobalStyles.inputTitle}>{strings.PHONE}</Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 11,
                          maxLength: 11,
                          pattern: /^01(?:0)\d{4}\d{4}$/,
                        }}
                        name="phone"
                        placeholder={strings.PLEASE_ENTER_TEL}
                        keyboard="phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.phone && (
                        <Text style={GlobalStyles.errorMessage}>
                          전화번호 에러.
                        </Text>
                      )}
                    </View>
                    <Text style={GlobalStyles.inputTitle}>
                      {strings.NICKNAME}
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 2,
                          // maxLength: 2,
                        }}
                        name="nickName"
                        placeholder={strings.PLEASE_ENTER_TEL}
                        keyboard="name-phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.nickName && (
                        <Text style={GlobalStyles.errorMessage}>
                          {strings.NICKNAME} {strings.ERROR}
                        </Text>
                      )}
                    </View>
                    <Text style={GlobalStyles.inputTitle}>아파트 이름</Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 2,
                          // maxLength: 2,
                        }}
                        name="groupName"
                        placeholder={'아파트 이름'}
                        keyboard="name-phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.nickName && (
                        <Text style={GlobalStyles.errorMessage}>
                          {/* {strings.NICKNAME} {strings.ERROR} */}
                          아파트 이름 에러
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  HStackTitle: {
    flexDirection: 'row',
    marginTop: RFPercentage(1),
    padding: RFPercentage(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  HeadTitleText: {
    fontWeight: 'bold',
    fontSize: RFPercentage(3),
    marginTop: RFPercentage(2),
  },

  UserInfoBorderBox: {
    marginVertical: RFPercentage(1),
    padding: RFPercentage(1),
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: RFPercentage(2),
  },
  HCStack: {
    marginHorizontal: width * 0.1,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'center',

    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: colors.white,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    width: RFPercentage(10),
    height: 'auto',
    alignItems: 'center',
    backgroundColor: '#28a745',
    marginTop: RFPercentage(1),
    padding: RFPercentage(1),
    borderRadius: RFPercentage(1),
  },
  orderButton: {
    width: width * 0.88,
    height: 'auto',
    alignItems: 'center',
    backgroundColor: '#28a745',
    marginTop: RFPercentage(2),
    padding: RFPercentage(2),
    borderRadius: RFPercentage(1),
  },
});

export default ChatRegisterScreen;
