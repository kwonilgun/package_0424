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
import { EditProducerScreenProps } from '../model/types/TEditNavigator';
import { IProducerInfo } from '../model/interface/IAuthInfo';




const EditProducerScreen: React.FC<EditProducerScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProducer] = useState<IProducerInfo | null>(null);
  const [producersList, setProducersList] = useState<IProducerInfo[]|null>(null);
  const [selectedProducer, setSelectedProducer] = useState<string | null>(null); // 선택된 producer 상태
  const [currentProducer, setCurrentProducer] = useState<IProducerInfo|null>(null);




  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<IProducerInfo>({
    defaultValues: {
      name: props.route.params.item.name,
      nickName: props.route.params.item.nickName,
      phoneNumber: props.route.params.item.phoneNumber,
      bankName: props.route.params.item.bankName,
      bankNumber: props.route.params.item.bankNumber,
      isProducerNumber: props.route.params.item.isProducerNumber,

    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log(
        'EditProductScreen useFocusEffect'
      );

      setProducer(props.route.params.item);
      setSelectedProducer(props.route.params.item.id);

      return () => {
        setLoading(true);
      };
    }, [props]),
  );



  const isChanged = () => {
    const currentValues = getValues();

    // defaultValues의 타입 정의
    const defaultValues: any = {
      name: props.route.params.item.name,
      nickName: props.route.params.item.nickName,
      phoneNumber: props.route.params.item.phoneNumber,
      bankName: props.route.params.item.bankName,
      bankNumber: props.route.params.item.bankNumber,
      isProducerNumber: props.route.params.item.isProducerNumber,
    };

    // 기본값과 현재 값 비교
    const hasChanged = (Object.keys(defaultValues) as (keyof typeof currentValues)[]).some(
      key => defaultValues[key] !== currentValues[key]
    );

    console.log('isChanged: ', hasChanged);
    return hasChanged;
  };


  const confirmUpload: SubmitHandler<IProducerInfo> = async data => {
    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: '상품 등록',
      func: async (in_data: IProducerInfo) => {
        console.log('업로드 상품 data = ', in_data);
        const token = await getToken();
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
        };


        axios
          .put(`${baseURL}producers/${selectedProducer}`, JSON.stringify(in_data), config)
          .then(res => {
            if (res.status === 200 || res.status === 201) {
             alertMsg('success', '상품 성공적으로 추가됨');
            }
          })
          .catch(error => {
            console.error(error);
            errorAlert('1. 상품업로드 에러', ' ' + error);
          });

      },
      params: [data],
    };

    confirmAlert(param);
  };

  const isProducerChanged = ()=>{
    return props.route.params.item.id !== selectedProducer;
  };

  const uploadProducerInfo = () => {
    console.log('생산자 정보 업로드');
    if (isChanged() || isProducerChanged()) {
      console.log('데이타가 변경되었습니다. ');
      handleSubmit(confirmUpload)();
    } else {
      errorAlert(strings.ERROR, '데이터 변경이 없음');
    }
  };

  const deleteProducerInfo = async () => {
    console.log('deleteProduerInfo');
    const param: ConfirmAlertParams = {
      title: strings.DELETE,
      message: '생산자 삭제',
      func: async () => {
        const token = await getToken();

        //헤드 정보를 만든다.
        const config = {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
          params: {id: selectedProducer},
        };
        //2023-02-16 : await 로 변경함. 그리고 에러 발생 처리
        try {
          console.log('producer 삭제 id = ', selectedProducer);
          const response: AxiosResponse = await axios.delete(
            `${baseURL}producers/${selectedProducer}`,
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
                        uploadProducerInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.REGISTER}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        deleteProducerInfo();
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>{strings.DELETE}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.UserInfoBorderBox}>


                    {/* 이름 */}
                    <Text style={[GlobalStyles.inputTitle]}>
                      {strings.NAME}
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 2,
                        }}
                        name="name"
                        placeholder={strings.PLEASE_ENTER_NAME}
                        keyboard="name-phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.name && (
                        <Text style={GlobalStyles.errorMessage}>
                          {strings.NAME} {strings.ERROR}
                        </Text>
                      )}
                    </View>

                    {/* 전화번호 */}
                    <Text style={[GlobalStyles.inputTitle]}>
                      전화 번호
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 11,
                          maxLength: 11,
                          pattern: /^01(?:0)\d{4}\d{4}$/,
                        }}
                        name="phoneNumber"
                        placeholder="전화번호 입력하세요"
                        keyboard="phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.phoneNumber && (
                        <Text style={GlobalStyles.errorMessage}>
                          전화번호 에러.
                        </Text>
                      )}
                    </View>

                    {/* 은행 이름 */}
                    <Text style={[GlobalStyles.inputTitle]}>
                      은행 이름
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 2,
                        }}
                        name="bankName"
                        placeholder= "은행이름 입력하세요"
                        keyboard="name-phone-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.bankName && (
                        <Text style={GlobalStyles.errorMessage}>
                          은행이름 {strings.ERROR}
                        </Text>
                      )}
                    </View>

                      {/* 계좌 번호 */}
                    <Text style={[GlobalStyles.inputTitle]}>
                      계좌 번호
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                          minLength: 5,
                        }}
                        name="bankNumber"
                        placeholder="계좌번호 입력하세요"
                        keyboard="number-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.name && (
                        <Text style={GlobalStyles.errorMessage}>
                          계좌번호{strings.ERROR}
                        </Text>
                      )}
                    </View>

                    <Text style={[GlobalStyles.inputTitle]}>
                      생산자 번호
                    </Text>
                    <View style={GlobalStyles.HStack}>
                      <InputField
                        control={control}
                        rules={{
                          required: true,
                        }}
                        name="isProducerNumber"
                        placeholder="생산자 입력하세요"
                        keyboard="number-pad" // 숫자 판으로 변경
                        isEditable={true}
                      />
                      {errors.isProducerNumber && (
                        <Text style={GlobalStyles.errorMessage}>
                          생산자 번호 {strings.ERROR}
                        </Text>
                      )}
                    </View>
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
  pickerContainer: {
    width: '95%',
    borderColor: 'black', // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 10, // 테두리 둥글기
    // marginBottom: 10, // 여백
    // overflow: 'hidden', // 내부 요소가 테두리를 벗어나지 않도록
  },
  picker: {
    height: RFPercentage(8),
    // width: '80%',
    // backgroundColor: colors.white,
    // borderColor: 'black',
    // borderWidth: 2,
    // borderRadius: 10,
    // marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center', // 수평 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬 (필요 시 추가)
    marginVertical: RFPercentage(2), // 상하 여백
  },
  image: {
    width: RFPercentage(30),
    height: RFPercentage(20),
    borderRadius: 10,
  },

  cameraContainer:{
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  camera: {
    marginHorizontal: RFPercentage(1),
    color: colors.black,
    fontSize: RFPercentage(5),
    fontWeight: 'bold',
  },

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

export default EditProducerScreen;
