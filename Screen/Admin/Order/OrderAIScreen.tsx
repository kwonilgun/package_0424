/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import {
  Button, KeyboardAvoidingView,
  Platform, ScrollView, Text, TouchableOpacity
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../../styles/colors';
import GlobalStyles from '../../../styles/GlobalStyles';
import HeaderComponent from '../../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../../utils/basicForm/WrapperContainer';
// import Voice from '@react-native-community/voice';

import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../../assets/common/BaseUrl';
import { getToken } from '../../../utils/getSaveToken';
import { OrderAIScreenProps } from '../../model/types/TAdminOrderNavigator';


interface OrderDetails {
  // 주문 정보의 구조에 따라 이 인터페이스를 정의하세요.
  // 예시:
  orderId: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const OrderAIScreen: React.FC<OrderAIScreenProps> = props => {
  const [orderNumber, setOrderNumber] = useState<string>('123456');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);



  // 주문 정보 조회
  const fetchOrderDetails = async (): Promise<void> => {

    const token = await getToken();
    //헤드 정보를 만든다.
    const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
    };
    const data = {orderNumber: orderNumber};
    try {
      const response: AxiosResponse =  await axios.post(
        `${baseURL}gemini/orderNumber`,
        JSON.stringify(data),
        config,
      ); 
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };


  const onPressLeft = () => {
    props.navigation.navigate('AdminOrderMainScreen');
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
        centerText="주문 현황"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        isRight={false}
      />

      {/* {loading ? (
        <>
          <LoadingWheel />
        </>
      ) : ( */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={GlobalStyles.containerKey}>

        <Text style={{ fontSize: 18, marginBottom: 16 }}>
                주문 번호: {orderNumber}
        </Text>

        <Button title="주문 정보 조회" onPress={fetchOrderDetails} />
        {orderDetails && (
          <ScrollView style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16 }}>주문 정보:</Text>
            <Text>{JSON.stringify(orderDetails, null, 2)}</Text>
          </ScrollView>
        )}

        </KeyboardAvoidingView>
      {/* )} */}
    </WrapperContainer>
  );
};


export default OrderAIScreen;
