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
import { getToken } from '../../utils/getSaveToken';
import axios from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';
import GlobalStyles from '../../styles/GlobalStyles';
import { width } from '../../assets/common/BaseValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { errorAlert } from '../../utils/alerts/errorAlert';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import { AddLastOrderScreenProps } from '../model/types/TEditNavigator';
import { ILastOrderInfo } from './EditMainScreen';
import { dateToKoreaDate } from '../../utils/time/dateToKoreaTime';
import DateTimePickerModal from "react-native-modal-datetime-picker";




const AddLastOrderScreen: React.FC<AddLastOrderScreenProps> = props => {
  const {state} = useAuth();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    formState: {errors},
    reset,
  } = useForm<ILastOrderInfo>({
    defaultValues: {
      id: '',
      date: null,
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log(
        'AddLastOrderScreen useFocusEffect'
      );

      return () => {
      };
    }, []),
  );


  const isChanged = () => {
    const currentValues = getValues();

    // defaultValues의 타입 정의
    const defaultValues: ILastOrderInfo = {
      id: '',
      date: null,
    };

    // 기본값과 현재 값 비교
    const hasChanged = (Object.keys(defaultValues) as (keyof typeof currentValues)[]).some(
      key => defaultValues[key] !== currentValues[key]
    );

    console.log('isChanged: ', hasChanged);
    return hasChanged;
  };


  const confirmUpload: SubmitHandler<ILastOrderInfo> = async data => {
    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '주문 마감 등록',
      func: async (in_data: ILastOrderInfo) => {
        console.log('업로드 Last order data = ', in_data);
        const token = await getToken();

        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };


        console.log('EditProducerScreen data', data.date?.toISOString());

        axios
          .post(`${baseURL}orderSql/lastOrder`, JSON.stringify(data), config)
          .then(res => {
            if (res.status === 200 || res.status === 201) {
             alertMsg('success', '주문 마감 성공적으로 추가됨');
            }
          })
          .catch(error => {
            console.error(error);
            // alert("1. 상품 업데이트 실패" + error)
            // setShowModal(false);
            errorAlert('1. 상품업로드 에러', ' ' + error);
          });

      },
      params: [data],
    };

    confirmAlert(param);
  };

  const uploadLastOrderInfo = () => {
    console.log('AddProducerScreen : 생산자 정보 업로드');
    if (isChanged()) {
      console.log('데이타가 변경되었습니다. ');
      handleSubmit(confirmUpload)();
    } else {
      errorAlert(strings.ERROR, '데이터 변경이 없음');
    }
  };

  const onPressLeft = () => {
    props.navigation.navigate('EditManager', {screen: 'EditMainScreen'});
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <FontAwesome
          style={{
            marginHorizontal: RFPercentage(1),
            color: colors.black,
            fontSize: RFPercentage(5),
            fontWeight: 'bold',
          }}
          name="arrow-left"
        />
      </TouchableOpacity>
    );
  };


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
      setDatePickerVisibility(false);
    };
  
  const handleConfirm = (date: Date) => {
    setValue('date', date);
    console.log('handleConfirm date ', date.toISOString());
    console.log('AddLastOrderScreen deliveryDate =', dateToKoreaDate(date) );
    hideDatePicker();
  };



  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={'생산자 추가'}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />
        <>
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
                        uploadLastOrderInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.REGISTER}</Text>
                    </TouchableOpacity>

                  </View>

                  <View style={styles.UserInfoBorderBox}>
                  
                  
                    {/* 이름 */}
                    
                    <View style={styles.HCButton}>
                          <Text style={styles.inputTitle}>주문 마감 : </Text>
                          <TouchableOpacity onPress={() => {
                              showDatePicker();
                            }}>
                            <View style={styles.buttonSmall}>
                                <Text style={styles.buttonTextStyle}>
                                  날짜 지정
                                </Text>
                            </View>
                          </TouchableOpacity>
    
                          <TouchableOpacity onPress={async () => {
                                console.log('OrderChangeScreen 미정 버튼 click');
                                setValue('date', null);
                                await trigger('date'); // 즉시 업데이트 반영
                              }}>
                              <View style={[styles.buttonSmall, {marginLeft: RFPercentage(3)}]}>
                                  <Text style={styles.buttonTextStyle}>
                                    미정
                                  </Text>
                              </View>
                            </TouchableOpacity>
                    </View>
                    <View style={{marginLeft:RFPercentage(2),  marginTop: RFPercentage(1) }}>
                                        <Text>
                                          {getValues('date')
                                            ? dateToKoreaDate(new Date(getValues('date')!)) // Date 객체로 변환하여 출력
                                            : '주문 마감 지정되지 않음'}
                                        </Text>
                    </View>
                    <DateTimePickerModal
                                      isVisible={isDatePickerVisible}
                                      mode="date"
                                      date={getValues('date') ? new Date(getValues('date')!) : new Date()}
                                      // date={new Date()}
                                      onConfirm={handleConfirm}
                                      onCancel={hideDatePicker}
                                      locale="ko-KR" // 한국어 로케일 설정
                                    />

                  </View>

                </View>
              </ScrollView>
            </KeyboardAvoidingView>
        </>
      {/* )} */}
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
  inputTitle: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: 'black',
    // marginTop: RFPercentage(1),
  },

  HCButton: {
      // flex: 0.8,
      width: 'auto',
      height: RFPercentage(4),
      marginTop: RFPercentage(2),
      // padding: 5,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignContent: 'center',
      alignItems: 'center',
      // borderColor: 'red',
      // borderWidth: 1,
      borderRadius: RFPercentage(0.5),
    },
    buttonSmall: {
          height: RFPercentage(4),
          backgroundColor: colors.lightBlue,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          borderRadius: RFPercentage(0.3),
    
      },
      buttonTextStyle: {
          width: 'auto',
          // height: RFPercentage(4),
          padding: RFPercentage(0.5),
          color: 'white',
          fontSize: RFPercentage(2),
          fontWeight: 'bold',
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
  
 
  buttonText: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: colors.white,
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
  
});

export default AddLastOrderScreen;
