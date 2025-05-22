/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WrapperContainer from '../../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';

import colors from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';

import { AdminOrderMainScreenProps } from '../../model/types/TAdminOrderNavigator';
import LoadingWheel from '../../../utils/loading/LoadingWheel';
import { getToken } from '../../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../../assets/common/BaseUrl';
import { IOrderInfo } from '../../model/interface/IOrderInfo';
import { DataList, makeExpandableDataList, updateLayout } from '../../Orders/makeExpandable';
import isEmpty from '../../../utils/isEmpty';
import { AdminExpandable } from '../../Orders/AdminExpandable';

import { height, width } from '../../../styles/responsiveSize';
import adminDeleteOrder from '../../Orders/adminDeleteOrder';
import { alertMsg } from '../../../utils/alerts/alertMsg';

const AdminOrderMainScreen: React.FC<AdminOrderMainScreenProps> = props => {

  const [loading, setLoading] = useState<boolean>(true);
  const [dataList, setDataList] = useState<DataList | null>(null);
  const [dataPaymentCompleteList, setDataPaymentCompleteList] = useState<DataList | null>(null);
  const [dataOnDeliveryList, setDataOnDeliveryList] = useState<DataList | null>(null);
  const [dataDeliveryCompleteList, setDataDeliveryCompleteList] = useState<DataList | null>(null);
  const [orders, setOrders] = useState<IOrderInfo[] | null>(null);
  const [orderList, setOrderList] = useState<DataList | null>(null);
  const [paymentCompleteList, setPaymentCompleteList] = useState<DataList | null>(null);
  const [onDeliveryList, setOnDeliveryList] = useState<DataList | null>(null);
  const [deliveryCompleteList, setDeliveryCompleteList] = useState<DataList | null>(null);

  useFocusEffect(
    useCallback(() => {
      console.log('AdminOrderMainScreen : useFocusEffect 진입');
      setDataList([]);
      setDataPaymentCompleteList([]);
      setDataOnDeliveryList([]);
      setDataDeliveryCompleteList([]);
      checkOrderStatus();
      fetchPaymentComplete();
      fetchOnDelivery();
      fetchDeliveryComplete();
      return () => {
        console.log('AdminOrderMainScreen : useFocusEffect exit');
        setLoading(true);
      };
    }, []),
  );


  const checkOrderStatus = async () => {

    const token = await getToken();
              //헤드 정보를 만든다.
    const config = {
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                  },
              };
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orderSql`,
        config
      );

      const orders = response.data as IOrderInfo[];
      console.log('AdminOrderMainScreen orders = ', orders);

      if (orders.length) {
        // 2023-05-20 : Date를 new를 통해서 값으로 변환해야 소팅이 동작이 된다. 아니면 NaN이 리턴이 된다.
        orders.sort(
          (a, b) =>
            new Date(b.dateOrdered).getTime() -
            new Date(a.dateOrdered).getTime(),
        );
        makeExpandableDataList(orders, setDataList);
        setOrderList(dataList);
        setOrders(orders);

      }
      else{
        console.log(' is empty');
        setOrderList([]);
      }
    } catch (error) {
      console.log('ProfileScreen CheckOrderList error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentComplete = async () => {

    const token = await getToken();
              //헤드 정보를 만든다.
    const config = {
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                  },
              };
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orderSql/PaymentComplete`,
        config
      );

      const orders = response.data as IOrderInfo[];
      console.log('fetchPaymentComplete orders = ', orders);

      if (orders.length) {
        // 2023-05-20 : Date를 new를 통해서 값으로 변환해야 소팅이 동작이 된다. 아니면 NaN이 리턴이 된다.
        orders.sort(
          (a, b) =>
            new Date(b.dateOrdered).getTime() -
            new Date(a.dateOrdered).getTime(),
        );
        makeExpandableDataList(orders, setDataPaymentCompleteList);
        setPaymentCompleteList(dataPaymentCompleteList);

      } else{
        console.log('setPaymentCompletesList is Empty');
        setPaymentCompleteList([]);
      }
    } catch (error) {
      console.log('ProfileScreen CheckOrderList error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnDelivery = async () => {

    const token = await getToken();
    //헤드 정보를 만든다.
    const config = {
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                  },
              };
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orderSql/OnDelivery`,
        config
      );

      const orders = response.data as IOrderInfo[];
      // console.log('fetchOnDelivery orders = ', orders);

      if (orders.length) {
        // 2023-05-20 : Date를 new를 통해서 값으로 변환해야 소팅이 동작이 된다. 아니면 NaN이 리턴이 된다.
        orders.sort(
          (a, b) =>
            new Date(b.dateOrdered).getTime() -
            new Date(a.dateOrdered).getTime(),
        );
        makeExpandableDataList(orders, setDataOnDeliveryList);
        setOnDeliveryList(dataOnDeliveryList);

      }
      else{
        setOnDeliveryList([]);
      }
    } catch (error) {
      console.log('ProfileScreen fetchOnDelivery error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryComplete= async () => {

    const token = await getToken();
    //헤드 정보를 만든다.
    const config = {
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                  },
              };
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orderSql/DeliveryComplete`,
        config
      );

      const orders = response.data as IOrderInfo[];
      // console.log('fetchDeliveryComplete orders = ', orders);

      if (orders.length) {
        // 2023-05-20 : Date를 new를 통해서 값으로 변환해야 소팅이 동작이 된다. 아니면 NaN이 리턴이 된다.
        orders.sort(
          (a, b) =>
            new Date(b.dateOrdered).getTime() -
            new Date(a.dateOrdered).getTime(),
        );
        makeExpandableDataList(orders, setDataDeliveryCompleteList);
        setOnDeliveryList(dataDeliveryCompleteList);

      } else{
        setOnDeliveryList([]);
      }
    } catch (error) {
      console.log('ProfileScreen fetchOnDelivery error', error);
    } finally {
      setLoading(false);
    }
  };

  const gotoTotalChangeScreen = ()=>{
    console.log('전체 업데이트');
    props.navigation.navigate('OrderTotalChangeScreen');
  };

  const deleteAllOrders = async () => {
    console.log('전체 주문 삭제');
    const token = await getToken();
              //헤드 정보를 만든다.
    const config = {
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                  },
              };
    try {
      const response: AxiosResponse = await axios.delete(
        `${baseURL}orderSql/allDelete`,
                    config,
      );
      if (response.status === 200 || response.status === 201) {
        console.log('response.data = ', response.data);
            alertMsg('성공', response.data);
      }
    } catch (error) {
      console.log('에러 = ', error);
    }
  };

  const renderTotalOrdersStatus =  () => (
        <View style={styles.Container}>
             <Text style={styles.title}>전체 주문 현황</Text>

             <Text onPress = {gotoTotalChangeScreen}> 전체 업데이트</Text>
             <Text onPress = {deleteAllOrders}> 주문 전체 삭제</Text>

             <ScrollView>
              <View style={styles.listContainer}>
                {/* <Text style={styles.title}>주문리스트</Text> */}

                {dataList ? (
                  dataList.map((item, index) => {
                    if (!isEmpty(item.subtitle)) {
                      return (
                        <View key={index} style={{marginTop: RFPercentage(1)}}>
                          <AdminExpandable
                            navigation={props.navigation}
                            item={item}
                            onClickFunction={() => {
                              updateLayout(index, dataList, setOrderList);
                            }}
                            actionFt={adminDeleteOrder}
                            orders={orderList!}
                          />
                        </View>
                      );
                    }
                    return null;
                  })
                ) : (
                  <Text style={{textAlign: 'center'}}> 정보 없음</Text>
                )}
              </View>
            </ScrollView>

        </View>
    );

  const renderPaymentComplete =  () => (
      <View style={styles.Container}>
           <Text style={styles.title}>결재 완료</Text>

           <ScrollView>
            <View style={styles.listContainer}>

              {dataPaymentCompleteList ? (
                dataPaymentCompleteList.map((item, index) => {
                  if (!isEmpty(item.subtitle)) {
                    return (
                      <View key={index} style={{marginTop: RFPercentage(1)}}>
                        <AdminExpandable
                          navigation={props.navigation}
                          item={item}
                          onClickFunction={() => {
                            updateLayout(index, dataPaymentCompleteList, setPaymentCompleteList);
                          }}
                          actionFt={adminDeleteOrder}
                          orders={paymentCompleteList!}
                        />
                      </View>
                    );
                  }
                  return null;
                })
              ) : (
                <Text style={{textAlign: 'center'}}> 정보 없음</Text>
              )}
            </View>
          </ScrollView>

      </View>
  );

  const renderOnDelivery =  () => (
    <View style={styles.Container}>
         <Text style={styles.title}>배송 처리 중</Text>

         <ScrollView>
          <View style={styles.listContainer}>

            {dataOnDeliveryList ? (
              dataOnDeliveryList.map((item, index) => {
                if (!isEmpty(item.subtitle)) {
                  return (
                    <View key={index} style={{marginTop: RFPercentage(1)}}>
                      <AdminExpandable
                        navigation={props.navigation}
                        item={item}
                        onClickFunction={() => {
                          updateLayout(index, dataOnDeliveryList, setDataOnDeliveryList);
                        }}
                        actionFt={adminDeleteOrder}
                        orders={onDeliveryList!}
                      />
                    </View>
                  );
                }
                return null;
              })
            ) : (
              <Text style={{textAlign: 'center'}}> 정보 없음</Text>
            )}
          </View>
        </ScrollView>

    </View>
  );


  const renderDeliveryComplete =  () => (
    <View style={styles.Container}>
         <Text style={styles.title}>배송 완료</Text>

         <ScrollView>
          <View style={styles.listContainer}>

            {dataDeliveryCompleteList ? (
              dataDeliveryCompleteList.map((item, index) => {
                if (!isEmpty(item.subtitle)) {
                  return (
                    <View key={index} style={{marginTop: RFPercentage(1)}}>
                      <AdminExpandable
                        navigation={props.navigation}
                        item={item}
                        onClickFunction={() => {
                          updateLayout(index, dataDeliveryCompleteList, setDataDeliveryCompleteList);
                        }}
                        actionFt={adminDeleteOrder}
                        orders={deliveryCompleteList!}
                      />
                    </View>
                  );
                }
                return null;
              })
            ) : (
              <Text style={{textAlign: 'center'}}> 정보 없음</Text>
            )}
          </View>
        </ScrollView>

    </View>
  );

  const renderLists = () => (
          <FlatList
            ListHeaderComponent={
              <>
                {renderTotalOrdersStatus()}
                {renderPaymentComplete()}
                {renderOnDelivery()}
                {renderDeliveryComplete()}
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
        centerText="주문 메인"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={false}
        onPressRight={() => {}}
        isRightView={false}
        rightText=' '
      />

        {loading ? (
              <LoadingWheel />
            ) : (
              <>
                  {renderLists()}
              </>
        )}
    </WrapperContainer>
  );
};

export const styles = StyleSheet.create({
  Container: {
    margin: RFPercentage(0.5),
    padding: RFPercentage(0.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: RFPercentage(1),
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
      padding: RFPercentage(1),
      borderRadius: 10,
      alignItems: 'center',
    },

    totalSalesText: {
      fontSize: RFPercentage(2),
      fontWeight: 'bold',
      color: 'black',
      marginBottom: RFPercentage(0.5),
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  subtitleHeader: {
    flexDirection: 'row',
    width: width * 0.7,
    marginTop: RFPercentage(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  titleDate: {
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
  },
  titleRevenue: {
    marginLeft: RFPercentage(20),
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
  },
  listContainer: {
    // marginTop: RFPercentage(0.1),
    paddingHorizontal: RFPercentage(2),
    paddingBottom: RFPercentage(1),
  },
  listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: RFPercentage(1),
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
      },
  monthText: {
    fontSize: RFPercentage(2),
    color: colors.black,
    marginRight: RFPercentage(4),
  },
  profitText: {
    fontSize: RFPercentage(2),
    color: colors.black,
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  saveButton: {
    width: 'auto',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    margin: RFPercentage(2),
    paddingVertical: RFPercentage(0.5),
    paddingHorizontal: RFPercentage(4),
    borderRadius: RFPercentage(1),
  },
  buttonText: {
      fontWeight: 'bold',
      fontSize: RFPercentage(2),
      color: colors.white,
    },
});
export default AdminOrderMainScreen;
