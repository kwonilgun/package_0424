/* eslint-disable react/self-closing-comp */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../styles/colors';
import isEmpty from '../../utils/isEmpty';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { OrderChangeScreenProps } from '../model/types/TUserNavigator';
import { IOrderInfo } from '../model/interface/IOrderInfo';
import GlobalStyles from '../../styles/GlobalStyles';
import { dateToKoreaDate } from '../../utils/time/dateToKoreaTime';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { IOrderItem } from '../model/interface/IOrderItem';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import strings from '../../constants/lang';
import { useAuth } from '../../context/store/Context.Manager';
import DropDownPicker from 'react-native-dropdown-picker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { alertMsg } from '../../utils/alerts/alertMsg';
import { errorAlert } from '../../utils/alerts/errorAlert';
import DateTimePickerModal from "react-native-modal-datetime-picker";


type IOrderStatus = {
  status: number|null,
  deliveryDate?: Date | null | undefined;
};



const OrderChangeScreen: React.FC<OrderChangeScreenProps> = props => {
  const {state} = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [item] = useState<IOrderInfo>(props.route.params?.item);
  const [orderItem, setOrderItem] = useState<IOrderItem | null>(null);
  // const [total, setTotal] = useState<Number>(0);

  const [openMethod, setOpenMethod] = useState<boolean>(false);
  const [valueMethod, setValueMethod] = useState<number>(Number(props.route.params?.item.status));
  const [itemsMethod, setItemsMethod] = useState([
      {label: '주문 접수', value: 1},
      {label: '결재 완료', value: 2},
      {label: '배송 준비', value: 3},
      {label: '배송중', value: 4},
      {label: '배송 완료', value: 5},
      {label: '반품 요청', value: 6},
      {label: '반품 완료', value: 7},
    ]);

  const isAdmin = state.user?.isAdmin;
  console.log('OrderChangeScreen item = ', props.route.params?.item);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);



  const {
      control,
      setValue,
      getValues,
      handleSubmit,
      formState: {errors},
      trigger,
      reset,
    } = useForm<IOrderStatus>({
      defaultValues: {
       status: Number(props.route.params?.item.status),
       deliveryDate: props.route.params?.item.deliveryDate,
      },
    });

  useEffect(() => {
    if (!isEmpty(props.route.params.item)) {
      console.log('');
      fetchOrderItemFromAWS();
      setLoading(false);
    }
    return () => {
      console.log('OrderChangeScreen: useEffect : exit 한다.');
      setLoading(true);
    };
  }, [props.route.params.item]);

  const fetchOrderItemFromAWS = async () => {
    const token = await getToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const orderItemNumber = item.orderItems;
    console.log('OrderChange orderItemNumber ', orderItemNumber);

    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orders/orderItems/${orderItemNumber}`,
        config,
      );
      if (response.status === 200) {
        setOrderItem(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onPressLeft = () => {
    props.navigation.goBack();
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <FontAwesome
          style={{
            height: RFPercentage(8),
            width: RFPercentage(10),
            marginTop: RFPercentage(2),
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

  const deleteOrderItem = async () => {
    console.log('OrderedDetail.jsx: 삭제 누름');

    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '주문을  삭제하시겠습니까?',
      func: props.route.params.actionFt,
      params: [item.id, props],
    };

    confirmAlert(param);
  };

  const confirmUpload: SubmitHandler<IOrderStatus> = async data => {
    console.log('업로드 order status = ', data);

    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '주문상태 변경',
      func: async (in_data: IOrderStatus) => {
        console.log('주문상태 업로드 data = ', in_data);
        const status: IOrderStatus = in_data;

        const token = await getToken();
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          const response: AxiosResponse = await axios.put(
            `${baseURL}orderSql/status/${item.id}`,
            JSON.stringify(status),
            config,
          );
          if (response.status === 200 || response.status === 201) {
            alertMsg(strings.SUCCESS, strings.UPLOAD_SUCCESS);
          } else if (response.status === 202) {
            alertMsg('에러', '주문상태 202');
          } else if (response.status === 203) {
            alertMsg('에러', '주문 ');
          }
        } catch (error) {
          console.log('confirmUpload error, error = ', error);
          alertMsg(strings.ERROR, strings.UPLOAD_FAIL);
        }
      },
      params: [data],
    };

    confirmAlert(param);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setValue('deliveryDate', date);
    console.log('OrderDetailScreen deliveryDate =', dateToKoreaDate(date) );
    hideDatePicker();
  };

  const checkChangedValues  = () => {
    return Number(props.route.params?.item.status) !== getValues('status') || props.route.params?.item.deliveryDate !== getValues('deliveryDate');
  };

  

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="주문 상세"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />
      <>
        {loading ? (
          <LoadingWheel />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.containerKey}>
            <ScrollView
              style={GlobalStyles.scrollView}
              keyboardShouldPersistTaps="handled">
              <View style={GlobalStyles.VStack}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: RFPercentage(0.2),
                    alignContent: 'center',
                    alignItems: 'center',
                  }} >
                   

                  {/* {props.route.params.actionFt === null ? null : (
                    <View style={styles.actionContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          deleteOrderItem();
                        }}>
                        <View style={GlobalStyles.buttonSmall}>
                          <Text style={GlobalStyles.buttonTextStyle}>삭제</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                )} */}
                </View>

              {/* 2025-01-31 11:34:25: isAdmin 이면 상태 변경을 허용한다. */}
              {isAdmin && (
                <View style={{flex: 0.8}}>
                <Text style={[GlobalStyles.inputTitle, {marginTop:RFPercentage(5)}]}>주문 상태 변경</Text>
                <View style={styles.HCStack}>
                  <DropDownPicker
                    style={{backgroundColor: 'gainsboro'}}
                    listMode="MODAL"
                    open={openMethod}
                    value={valueMethod}
                    items={itemsMethod}
                    setOpen={setOpenMethod}
                    setValue={setValueMethod}
                    setItems={setItemsMethod}
                    onChangeValue={value => {
                      console.log('act value', value);
                      setValue('status', value);
                    }} // 값이 바뀔 때마다 실행
                    listItemContainerStyle={{
                      margin: RFPercentage(2),
                      backgroundColor: 'gainsboro',
                    }}
                  />
                </View>

                <View style={styles.HCButton}>
                     <Text style={styles.inputTitle}>배송 예정일 : </Text>
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
                            setValue('deliveryDate', null);
                            await trigger('deliveryDate'); // 즉시 업데이트 반영
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
                      {getValues('deliveryDate')
                        ? dateToKoreaDate(new Date(getValues('deliveryDate')!)) // Date 객체로 변환하여 출력
                        : '배송일 지정되지 않음'}
                    </Text>
                </View>


                {isAdmin && (
                      <TouchableOpacity onPress={() => {

                            if( checkChangedValues() ){
                              handleSubmit(confirmUpload)();
                            }
                            else{
                              errorAlert('에러', '주문상태 변경 안됨');
                            }
                          }

                      }>
                        <View style={[GlobalStyles.buttonSmall, {marginTop: RFPercentage(10)}]}>
                        <Text style={GlobalStyles.buttonTextStyle}>
                        업데이트
                        </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  date={getValues('deliveryDate') ? new Date(getValues('deliveryDate')!) : new Date()}
                  // date={new Date()}
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                  locale="ko-KR" // 한국어 로케일 설정
                />

              </View>
              )}

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
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

  inputTitle:{
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
  },


  HCStack: {
      margin: RFPercentage(0.2),
      // padding: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
  actionContainer: {
     marginVertical: RFPercentage(1),
    // padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderContainer: {
    margin: RFPercentage(0.2),
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontWeight: '600',
    width: 120,
  },
  value: {
    flex: 1,
    paddingLeft: 10,
  },
  valueError: {
    color: 'red',
    paddingLeft: 10,
  },
});
export default OrderChangeScreen;
