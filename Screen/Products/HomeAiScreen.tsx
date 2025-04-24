/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';
import {
  Button, FlatList, KeyboardAvoidingView,
  Modal,
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity,
  View
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import GlobalStyles from '../../styles/GlobalStyles';
// import Voice from '@react-native-community/voice';

import LoadingWheel from '../../utils/loading/LoadingWheel';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { getToken } from '../../utils/getSaveToken';
import { HomeAiScreenProps } from '../model/types/TUserNavigator';
import { jwtDecode } from 'jwt-decode';
import { UserFormInput } from '../model/interface/IAuthInfo';
import { height, width } from '../../styles/responsiveSize';
import { dateToKoreaDate, dateToKoreaTime } from '../../utils/time/dateToKoreaTime';
import { IOrderInfo } from '../model/interface/IOrderInfo';

interface IAiOrderList {
  orderNumber: string;
  dateOrdered: string;
}

const HomeAiScreen: React.FC<HomeAiScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetail, setShowDetail] = useState<string[] | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalDetail, setModalDetail] = useState<boolean>(false);
  const [productModalVisible, setProductModalVisible] = useState<boolean>(false);
  const [productNames, setProductNames] = useState<string[] | null>(props.route.params.productNames);
  const [orderList, setOrderList] = useState<IAiOrderList[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);


  // console.log('product names = ', props.route.params.productNames);


  useFocusEffect(
    useCallback(() => {
      console.log('OrderAIScreen : useFocusEffect');

      fetchOrderList();


      return () => {
        setLoading(true);
        setModalVisible(false);
        setProductModalVisible(false);
      };
    }, []),
  );

  // 주문 정보 조회
  const fetchOrderDetails = async (item: IAiOrderList): Promise<void> => {

    setLoading(true);

    const token = await getToken();
    //헤드 정보를 만든다.
    const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
    };


    try {
      const response: AxiosResponse =  await axios.get(
        `${baseURL}gemini/order/${item.orderNumber}`,
        config,
      );

      console.log('fetchOrderDetail =', response.data);
      if(response.status === 200){
        console.log('HomeAiScreen - response.data', response.data);
        setShowDetail(response.data);
        setModalDetail(true);
      }

    } catch (error) {
      console.error('Error fetching ai order summary:', error);
    } finally{
        setLoading(false);
    }
  };

  const fetchOrderList = async (): Promise<void> => {

    const token = await getToken();
    const decoded: UserFormInput = jwtDecode(token!);
    const userId = decoded.userId === null || undefined ? '' : decoded.userId;

    //헤드 정보를 만든다.
    const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
    };


    try {
      const response: AxiosResponse =  await axios.get(
        `${baseURL}orderSql/${userId}`,
        config,
      );


      if(response.status === 200){
            const orders = response.data as IOrderInfo[];
            // console.log('HomeAiScreen orders = ', orders);
          // 날짜 정렬을 먼저 수행한 후 변환
            const list = orders
            .sort((a, b) => new Date(b.dateOrdered).getTime() - new Date(a.dateOrdered).getTime()) // 먼저 날짜 정렬
            .map((order: IAiOrderList) => ({
              orderNumber: order.orderNumber,
              dateOrdered: new Date(order.dateOrdered).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            }));

            setOrderList(list);
            // setModalVisible(true);
      }

    } catch (error) {
      console.error('Error fetching ai order summary:', error);
    } finally{
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
          }}
          name="arrow-left"
        />
      </TouchableOpacity>
    );
  };

  const renderOrderList = () => {
    return ( // return 추가
      <View style={styles.Container}>
        <Text style={styles.title}>주문 정보 조회</Text>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, { width: RFPercentage(15), borderWidth: 1, borderColor: 'black' }]}>
            주문날짜
          </Text>
          <Text style={[styles.headerText, { width: RFPercentage(15), borderWidth: 1, borderColor: 'black' }]}>
            주문번호
          </Text>
        </View>
        <FlatList
          data={orderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => 

              fetchOrderDetails(item)
            }>
              <View style={styles.subtitleContainer}>
                <Text style={[styles.itemText, {  width: RFPercentage(15), borderWidth: 1, borderColor: 'black' }]}>
                  {item.dateOrdered}
                </Text>
                <Text style={[styles.itemText, { width: RFPercentage(15), borderWidth: 1, borderColor: 'black' }]}>
                  {item.orderNumber}
                </Text>
                <Text>{'  ▶️ ' } {/* 인디케이터 추가 */}</Text>

              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}> 리스트 없음.</Text>}
        />
      </View>
    );
  };

  const renderLists = () => (
        <FlatList
          ListHeaderComponent={
            <>
              {renderOrderList()}
            </>
          }
          data={[]} // 빈 데이터 배열
          renderItem={() => null} // 빈 렌더링 함수
        />
      );


  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="Q/A"
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
          {renderLists()}

          <Modal
              animationType="slide"
              transparent={true}
              visible={modalDetail}
              onRequestClose={() => setModalDetail(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {/* <Text style={styles.modalTitle}>주문 정보</Text> */}
                  <FlatList
                    data={showDetail}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text>{item}</Text>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyMessage}> 리스트 없음.</Text>
                    }
                  />
                  <Button title="닫기" onPress={() => setModalDetail(false)} />
                </View>
              </View>
          </Modal>

        </>

      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  Container: {
    padding: RFPercentage(2),
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    // width: width * 0.9,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: 'auto',
    backgroundColor: 'white',
    // marginTop: RFPercentage(10),
    padding: RFPercentage(1),
    borderRadius: 10,
    alignItems: 'center',
  },
  iconStyle: {
    height: RFPercentage(8),
    width: RFPercentage(10),
    marginTop: RFPercentage(2),
    color: colors.black,
    fontSize: RFPercentage(5),
    fontWeight: 'bold',
  },
  
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  subtitleContainer: {

    flexDirection: 'row',
    alignItems: 'center', // 중앙 정렬
    // justifyContent: 'space-between',
    marginBottom: RFPercentage(0.5),
    // marginLeft: RFPercentage(1),
    // paddingHorizontal: RFPercentage(2),
    // borderWidth: 1,
    // borderColor: 'red',
  },
  headerContainer: {

    flexDirection: 'row',
    alignItems: 'center', // 중앙 정렬
    // justifyContent: 'space-between',
    marginBottom: RFPercentage(0.5),
    marginLeft: RFPercentage(-4),
    // paddingHorizontal: RFPercentage(2),
    borderWidth: 1,
    borderColor: 'red',
  },
  headerText: {
    // flex: 1, // 동일한 비율 유지
    fontSize: RFPercentage(1.5),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  itemText: {
    // flex: 1, // 동일한 비율 유지
    fontSize: RFPercentage(1.5),
    color: 'black',
    // fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },

});
export default HomeAiScreen;
