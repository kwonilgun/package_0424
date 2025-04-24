/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { FindOrderNumberScreenProps} from '../../model/types/TAdminOrderNavigator';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../../assets/common/BaseUrl';
import { IOrderInfo } from '../../model/interface/IOrderInfo';
import groupBy from 'group-by';
import { DataList, makeExpandableDataList, updateLayout } from '../../Orders/makeExpandable';
import isEmpty from '../../../utils/isEmpty';
import deleteOrder from '../../Orders/deleteOrder';
import { AdminExpandable } from '../../Orders/AdminExpandable';


const FindOrderNumberScreen: React.FC<FindOrderNumberScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);
  
  const [orderList, setOrderList] = useState<IOrderInfo[] | null>(null);
  const [searchText, setSearchText] = useState<string>(''); // 추가: 검색어 상태
  const [filteredOrders, setFilteredOrders] = useState<IOrderInfo[] | null>(null); // 추가: 필터링된 주
  


  useFocusEffect(
    useCallback(() => {
      console.log('FindOrderNumberScreen : useFocusEffect');
      checkOrderStatus();
      return () => {
        setLoading(true);
      };
    }, []),
  );


  const checkOrderStatus = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}orders`,
      );

      const orders = response.data as IOrderInfo[];

      if (orders.length) {

        console.log('checkOrderList result', orders);

        // // setProducerGroup(result);
        // makeExpandableDataList(orders, setDataList);
        setOrderList(orders);

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


  const renderOrderList =  (props: any) => (
      <View style={styles.orderListContainer}>
          <Text style={styles.title}>상품 리스트</Text>
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.orderItem}
                onPress={() => {
                  console.log('renderOrderList, 주문서 선택됨...');
                  props.navigation.navigate('AdminOrder', {
                    screen: 'OrderDetailScreen',
                    params: {
                      item: item,
                      actionFt: deleteOrder,
                    },
                  });
                  // startEdit(item);
                }} // Navigate to chat when a user is selected
              >
                <Text style={styles.orderName}>{item.orderNumber}--{item.receiverName}</Text>
              </TouchableOpacity>
            )}
            // ListHeaderComponent={renderAddProduct} // 리스트 상단에 추가 버튼 배치
            ListEmptyComponent={
              <Text style={styles.emptyMessage}> 리스트 없음.</Text>
            }
          />
      </View>

  );
  

  // 추가: 주문 번호 검색 함수
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (orderList) {
      const filtered = orderList?.filter(item => 
        item.orderNumber.toLowerCase() === text.toLowerCase()
      );

      // makeExpandableDataList(filtered!, setFilteredOrders);
      setFilteredOrders(filtered);
    }
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="주문 번호 찾기"
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
          {/* 추가: 검색 입력 필드 */}
          <TextInput
            style={styles.searchInput}
            placeholder="주문 번호를 입력하세요"
            value={searchText}
            onChangeText={handleSearch}
          />

          {renderOrderList(props)}


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
      // 추가: 검색 입력 필드 스타일
      searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        margin: 8,
      },

      orderListContainer: {
          padding: 10,
        },
      orderItem: {
        padding: 10,
        marginBottom: 5,
        backgroundColor: colors.grey,
        borderRadius: 5,
      },
      orderName: {
        fontSize: 16,
        color: colors.black,
      },
      title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        color: 'black',
      },
      emptyMessage: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
      },
});

export default FindOrderNumberScreen;
