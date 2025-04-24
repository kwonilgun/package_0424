/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useContext, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import {RFPercentage} from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import strings from '../../constants/lang';
import {useFocusEffect} from '@react-navigation/native';

// import {useAuth} from '../../context/store/Context.Manager';

import GlobalStyles from '../../styles/GlobalStyles';
import {ShippingRegisterScreenProps} from '../model/types/TShippingNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SubmitHandler, useForm} from 'react-hook-form';
import {UserFormInput} from '../model/interface/IAuthInfo';
import {IDeliveryInfo} from '../model/interface/IDeliveryInfo';
import InputField from '../../utils/InputField';
import DropDownPicker from 'react-native-dropdown-picker';
import {width} from '../../assets/common/BaseValue';
import {errorAlert} from '../../utils/alerts/errorAlert';
import isEmpty from '../../utils/isEmpty';
import {getToken} from '../../utils/getSaveToken';
import axios, {AxiosResponse} from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {useAuth} from '../../context/store/Context.Manager';
import {jwtDecode} from 'jwt-decode';
import {alertMsg} from '../../utils/alerts/alertMsg';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
// import {confirmAlert} from '../../utils/alerts/confirmAlert';

const ShippingRegisterScreen: React.FC<ShippingRegisterScreenProps> = props => {
  const {state, dispatch} = useAuth();

  const [openMethod, setOpenMethod] = useState<boolean>(false);
  const [valueMethod, setValueMethod] = useState<number>(0);
  const [itemsMethod, setItemsMethod] = useState([
    {label: '문앞에서', value: 0},
    {label: '부재시 문앞에서', value: 1},
    {label: '경비실', value: 2},
    {label: '택배함', value: 3},
    {label: '기타', value: 4},
  ]);

  const [loading, setLoading] = useState<boolean>(true);

  const [deliveryId, setDeliveryId] = useState<string>('');
  const [checkMark, setCheckMark] = useState<boolean>(false);

  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<IDeliveryInfo>({
    defaultValues: {
      phone: '',
      name: '',
      address1: '',
      address2: '',
      deliveryMethod: 0,
      checkMark: false,
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log('ShippingRegisterScreen : useFocusEffect');
      getShippingData();

      return () => {
        setLoading(true);
      };
    }, []),
  );

  const getShippingData = async () => {
    const tmp = await AsyncStorage.getItem('deliveryInfo');
    const data: IDeliveryInfo = JSON.parse(tmp!) as IDeliveryInfo;
    console.log('getShippingData data = ', data);

    //     if (data.address1) {
    //       setValue('address1', data.address1); // 전달받은 주소를 폼에 반영
    //     }

    reset(data);
    //
    setValueMethod(data.deliveryMethod);
  };

  const confirmUpload: SubmitHandler<IDeliveryInfo> = async data => {
    console.log('업로드 사용자 주소 data = ', data);

    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '배송지 업로드',
      func: async (in_data: IDeliveryInfo) => {
        console.log('업로드 confirm data = ', in_data);
        const deliveryInfo: IDeliveryInfo = in_data;

        const token = await getToken();
        const decoded = jwtDecode(token!) as UserFormInput;
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          const response: AxiosResponse = await axios.post(
            `${baseURL}delivery/${decoded.userId}`,
            JSON.stringify(deliveryInfo),
            config,
          );
          if (response.status === 200 || response.status === 201) {
            alertMsg(strings.SUCCESS, strings.UPLOAD_SUCCESS);
          } else if (response.status === 202) {
            alertMsg('에러', '관리자 모드, 배송지 없음');
          } else if (response.status === 203) {
            alertMsg('에러', '생산자 모드, 배송지 없음');
          } else if (response.status === 204) {
            alertMsg('에러', '전화번호가 이미 존재함');
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
  // 변경된 데이터 여부를 확인하는 함수
  const isDataChanged = () => {
    const currentValues = getValues();
    // 여기에서 변경 여부를 확인하고 필요한 로직을 수행
    console.log('currentValues = ', currentValues);

    const isVacant: boolean =
      isEmpty(currentValues.name) ||
      isEmpty(currentValues.phone) ||
      isEmpty(currentValues.address1);

    console.log('isVacant = ', isVacant);
    return !isVacant;
  };
  const addressChange = () => {
    console.log('addressChange ...');
  };

  const openAddressBook = async () => {
    const name = getValues('name');
    const phone = getValues('phone');
    const address1 = getValues('address1');
    const address2 = getValues('address2');
    const method = getValues('deliveryMethod');
    const deliveryInform: IDeliveryInfo = {
      id: '',
      name: name,
      phone: phone,
      address1: address1,
      address2: address2,
      checkMark: false,
      deliveryMethod: method!,
    };
    console.log('open address box... deliveryInform ', deliveryInform);

    await AsyncStorage.setItem('deliveryInfo', JSON.stringify(deliveryInform));

    props.navigation.navigate('ShippingPostScreen');
  };

  const onPressLeft = () => {
    props.navigation.navigate('ShippingMainScreen');
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

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="배송지 주소"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        <ScrollView
          style={GlobalStyles.scrollView}
          keyboardShouldPersistTaps="handled">
          <View style={GlobalStyles.VStack}>
            {/* <Text style={styles.title}>배송지 정보 입력해주세요</Text> */}

            <Text style={GlobalStyles.inputTitle}>{strings.NAME}</Text>
            <View style={GlobalStyles.HStack}>
              <InputField
                control={control}
                rules={{
                  required: true,
                  minLength: 2,
                  // maxLength: 11,
                  // pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                }}
                name="name"
                placeholder={strings.PLEASE_ENTER_NAME}
                keyboard="name-phone-pad" // 숫자 판으로 변경
                // isEditable={false}
              />
              {errors.name && (
                <Text style={GlobalStyles.errorMessage}>
                  {strings.NAME} {strings.ERROR}
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
                // isEditable={false}
              />
              {errors.phone && (
                <Text style={GlobalStyles.errorMessage}>전화번호 에러.</Text>
              )}
            </View>

            <Text style={GlobalStyles.inputTitle}>{strings.ADDRESS}</Text>
            <View style={GlobalStyles.HStack}>
              <InputField
                control={control}
                rules={{
                  required: true,
                  minLength: 2,
                }}
                name="address1"
                placeholder={strings.PLEASE_ENTER_ADDRESS}
                keyboard="default" // 기본 키보드로 변경
              />
              {errors.address1 && (
                <Text style={GlobalStyles.errorMessage}>
                  {strings.ADDRESS} {strings.ERROR}
                </Text>
              )}

              <TouchableOpacity
                onPress={openAddressBook}
                style={[GlobalStyles.icon]}>
                <FontAwesome
                  name={'address-book'}
                  size={RFPercentage(4)}
                  color="grey"
                />
              </TouchableOpacity>
            </View>

            <Text style={GlobalStyles.inputTitle}>
              {strings.ADDRESS_DETAIL}
            </Text>
            <View style={GlobalStyles.HStack}>
              <InputField
                control={control}
                rules={{
                  required: true,
                  minLength: 2,
                }}
                name="address2"
                placeholder={strings.PLEASE_ENTER_ADDRESS_DETAIL}
                keyboard="default" // 기본 키보드로 변경
              />
              {errors.address1 && (
                <Text style={GlobalStyles.errorMessage}>
                  {strings.ADDRESS} {strings.ERROR}
                </Text>
              )}
            </View>

            <View style={{flex: 0.8}}>
              <Text style={GlobalStyles.inputTitle}>배송시 요청사항</Text>
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
                    setValue('deliveryMethod', Number(value));
                  }} // 값이 바뀔 때마다 실행
                  listItemContainerStyle={{
                    margin: RFPercentage(2),
                    backgroundColor: 'gainsboro',
                  }}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isDataChanged()) {
                  console.log('데이타가 변경되었습니다. ');
                  handleSubmit(confirmUpload)();
                } else {
                  // 데이터가 변경되지 않은 경우에 대한 로직을 수행
                  errorAlert(strings.ERROR, strings.VACANT_DATA);
                }
              }}
              style={styles.saveButton}>
              <Text style={styles.buttonText}>{strings.UPLOAD}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    backgroundColor: '#28a745',
    marginTop: RFPercentage(1),
    padding: RFPercentage(2),
    borderRadius: RFPercentage(1),
  },
});

export default ShippingRegisterScreen;
