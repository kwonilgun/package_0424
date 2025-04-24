/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../../utils/basicForm/HeaderComponents';
import {RFPercentage} from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../../styles/colors';
import {useFocusEffect} from '@react-navigation/native';
import GlobalStyles from '../../../styles/GlobalStyles';

import LoadingWheel from '../../../utils/loading/LoadingWheel';
import { OrderStatusScreenProps } from '../../model/types/TAdminOrderNavigator';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../../assets/common/BaseUrl';
import { IOrderInfo } from '../../model/interface/IOrderInfo';
import groupBy from 'group-by';
import { DataList, makeExpandableDataList, updateLayout } from '../../Orders/makeExpandable';
import isEmpty from '../../../utils/isEmpty';
import deleteOrder from '../../Orders/deleteOrder';
import { AdminExpandable } from '../../Orders/AdminExpandable';
import { getToken } from '../../../utils/getSaveToken';


const OrderStatusScreen: React.FC<OrderStatusScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dataList, setDataList] = useState<DataList | null>(null);
  const [orderList, setOrderList] = useState<DataList | null>(null);
  


  useFocusEffect(
    useCallback(() => {
      console.log('OrderStatusScreen : useFocusEffect');
      checkOrderStatus();
      return () => {
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

      if (orders.length) {
        // 2023-05-20 : Date를 new를 통해서 값으로 변환해야 소팅이 동작이 된다. 아니면 NaN이 리턴이 된다.
        orders.sort(
          (a, b) =>
            new Date(b.dateOrdered).getTime() -
            new Date(a.dateOrdered).getTime(),
        );

        //💇‍♀️2023-05-22 :생산자 전화번호에  따라서 그룹핑을 한다. 전화번호는 변경이 되지 않기 때문에 이것을 이용해서 그룹핑을 하고, 생산자는 해당 정보에서 추출하면 된다. 전화번호가 핵심이다.

        /***
            Record는 TypeScript에서 제공하는 유틸리티 타입 중 하나로, 특정 키-값 쌍의 구조를 정의할 때 사용됩니다. Record는 다음과 같은 형태로 사용됩니다:
            Record<KeyType, ValueType>
            주요 특징
            KeyType: 객체의 키에 사용할 타입. 보통 string, number, symbol 또는 이러한 타입의 유니온을 사용합니다.
            ValueType: 각 키에 해당하는 값의 타입.
            Record를 사용하면 특정 키-값 쌍을 효율적으로 정의하고 타입 안전성을 유지할 수 있습니다.
        ****/
        const result: Record<string, IOrderInfo[]> = groupBy(
          orders,
          'producerPhone',
        );

        // console.log('checkOrderList result', result);

        // setProducerGroup(result);
        makeExpandableDataList(orders, setDataList);
        setOrderList(dataList);

        setLoading(false);
      }
    } catch (error) {
      console.log('ProfileScreen CheckOrderList error', error);
    } finally {
      setLoading(false);
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

      {loading ? (
        <>
          <LoadingWheel />
        </>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={GlobalStyles.containerKey}>
          <ScrollView>
              <View style={styles.listContainer}>
                {/* <Text style={styles.title}>주문리스트</Text> */}

                {dataList ? (
                  dataList.map((item, index) => {
                    if (!isEmpty(item.subtitle)) {
                      return (
                        <View key={index} style={styles.itemContainer}>
                          <AdminExpandable
                            navigation={props.navigation}
                            item={item}
                            onClickFunction={() => {
                              updateLayout(index, dataList, setOrderList);
                            }}
                            actionFt={deleteOrder}
                            orders={orderList!}
                          />
                        </View>
                      );
                    }
                    return null;
                  })
                ) : (
                  <Text style={{textAlign: 'center'}}> 주문 정보 없음</Text>
                )}
              </View>
            </ScrollView>
        </KeyboardAvoidingView>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
    listContainer: {
        margin: 8,
        padding: 16,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
      },
      itemContainer: {
        marginBottom: 10,
      },
});

export default OrderStatusScreen;
