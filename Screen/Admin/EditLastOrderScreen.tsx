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
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import GlobalStyles from '../../styles/GlobalStyles';
import { width } from '../../assets/common/BaseValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import InputField from '../../utils/InputField';
import { errorAlert } from '../../utils/alerts/errorAlert';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import { EditLastOrderScreenProps } from '../model/types/TEditNavigator';
import { ILastOrderInfo } from './EditMainScreen';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { dateToKoreaDate } from '../../utils/time/dateToKoreaTime';



const EditLastOrderScreen: React.FC<EditLastOrderScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastOrder, setLastOrder] = useState<ILastOrderInfo | null>(null);
  // const [producersList, setProducersList] = useState<IProducerInfo[]|null>(null);
  const [selectedLastOrder, setSelectedLastOrder] = useState<string | null>(null); // 선택된 producer 상태
  const [currentLastOrder, setCurrentLastOrder] = useState<ILastOrderInfo|null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  console.log('props.route.params.item.data = ', props.route.params.item.date);


  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    watch,
    formState: {errors},
    reset,
  } = useForm<ILastOrderInfo>({
    defaultValues: {
      id: props.route.params.item.id,
      date: props.route.params.item.date,
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log(
        'EditLastOrderScreen useFocusEffect props.route.params.item', props.route.params.item
      );

      setLastOrder(props.route.params.item);
      setSelectedLastOrder(props.route.params.item.id);

      return () => {
        setLoading(true);
      };
    }, [props]),
  );



  const isChanged = () => {
    const currentValues = getValues();

    // defaultValues의 타입 정의
    const defaultValues: any = {
      date: props.route.params.item.date,
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
      message: '마감 일정',
      func: async (in_data: ILastOrderInfo) => {
        console.log('업로드 Last order data = ', in_data);
        const token = await getToken();
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };


        axios
          .put(`${baseURL}orderSql/lastOrder/${selectedLastOrder}`, JSON.stringify(in_data), config)
          .then(res => {
            if (res.status === 200 || res.status === 201) {
             alertMsg('success', '주문 마감 수정함');
            }
          })
          .catch(error => {
            console.error(error);
            errorAlert('1. 주문 마감 업로드 에러', ' ' + error);
          });

      },
      params: [data],
    };

    confirmAlert(param);
  };

  const isLastOrderChanged = ()=>{
    return props.route.params.item.id !== selectedLastOrder;
  };

  const uploadLastOrderInfo = () => {
    console.log('Last Order 업로드');
    if (isChanged() || isLastOrderChanged()) {
      console.log('데이타가 변경되었습니다. ');
      handleSubmit(confirmUpload)();
    } else {
      errorAlert(strings.ERROR, '데이터 변경이 없음');
    }
  };

  const deleteLastOrderInfo = async () => {
    console.log('deleteLastOrderInfo');
    const param: ConfirmAlertParams = {
      title: strings.DELETE,
      message: '주문 마감 삭제',
      func: async () => {
        const token = await getToken();

        //헤드 정보를 만든다.
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
          params: {id: selectedLastOrder},
        };
        //2023-02-16 : await 로 변경함. 그리고 에러 발생 처리
        try {
          console.log('last order 삭제 id = ', selectedLastOrder);
          const response: AxiosResponse = await axios.delete(
            `${baseURL}orderSql/lastOrder/${selectedLastOrder}`,
            config,
          );
          if (response.status === 200 || response.status === 201) {
            alertMsg(strings.DELETE, strings.SUCCESS);
            props.navigation.goBack();
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
    console.log('EditLastOrderScreen deliveryDate =', dateToKoreaDate(date) );
    hideDatePicker();
  };


  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={'생산자 편집'}
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

                    <TouchableOpacity
                      onPress={() => {
                        deleteLastOrderInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.DELETE}</Text>
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
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
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
  inputTitle: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: 'black',
    // marginTop: RFPercentage(1),
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

  HStackTitle: {
    flexDirection: 'row',
    marginTop: RFPercentage(1),
    padding: RFPercentage(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  UserInfoBorderBox: {
    marginVertical: RFPercentage(1),
    padding: RFPercentage(1),
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: RFPercentage(2),
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

export default EditLastOrderScreen;
