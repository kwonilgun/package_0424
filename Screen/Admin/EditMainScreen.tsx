/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';
import {
  FlatList, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome';

import colors from '../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import strings from '../../constants/lang';
import { EditMainScreenProps } from '../model/types/TEditNavigator';
import { IProduct } from '../model/interface/IProductInfo';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';
import GlobalStyles from '../../styles/GlobalStyles';
import { IProducerInfo } from '../model/interface/IAuthInfo';
import { ISProduct } from './AddProductScreen';

const EditMainScreen: React.FC<EditMainScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);

    const [productList, setProductList] = useState<ISProduct[] | null>(null);
    const [producerList, setProducerList] = useState<IProducerInfo[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      console.log('EditMainScreen : useFocusEffect');
      setLoading(true);
      fetchProductList();
      fetchProducerList();

      return () => {
        setLoading(true);
      };
    }, []),
  );

  // 2025-01-28: 상품정보를 읽어온다.
  const fetchProductList = async () => {
    try {
      const token = await getToken();
      //헤드 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const response: AxiosResponse = await axios.get(
        `${baseURL}products/sql`,
        config,
      );
      if (response.status === 200) {
        // console.log('products = ', response.data);
        const productL = response.data as ISProduct[];
        productL.sort((a,b) => a.name.localeCompare(b.name));
        setProductList(productL);
      }
    } catch (error) {
      console.log('상품 리스트 없음');
      // alertMsg(strings.ERROR, '상품 리스트 없음');
    } finally {
      setLoading(false);
    }
  };

  // 2025-03-18 11:17:58, 생산자 정보를 읽어온다. 
  const fetchProducerList = async () => {
    try {
      const token = await getToken();
      //헤드 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const response: AxiosResponse = await axios.get(
        `${baseURL}producers`,
        config,
      );
      if (response.status === 200) {
        // console.log('products = ', response.data);
        const producerL = response.data as IProducerInfo[];
        producerL.sort((a,b) => a.name!.localeCompare(b.name!));
        setProducerList(response.data);
      }
    } catch (error) {
      console.log('생산자 리스트 없음');
      // alertMsg(strings.ERROR, '상품 리스트 없음');
    } finally{
      setLoading(false);
    }
  };

  const startEdit = (product: ISProduct) =>{
    console.log('start edit item ', product);
    props.navigation.navigate('EditProductScreen',{item:product});
  };

  const renderAddProduct = () => (
    <View style={{alignItems: 'center', marginTop: 10}}>
    <View style={{margin: RFPercentage(2), alignItems: 'flex-end'}}>
      <TouchableOpacity
        onPress={async () => {
          console.log('EditMainScreen: renderAdddProduct. ');
          props.navigation.navigate('AddProductScreen');
        }}>
        <View style={GlobalStyles.buttonSmall}>
          <Text style={{fontSize: RFPercentage(3)}}> + </Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
  );

  const renderAddProducer = () => (
    <View style={{alignItems: 'center', marginTop: 10}}>
    <View style={{margin: RFPercentage(2), alignItems: 'flex-end'}}>
      <TouchableOpacity
        onPress={async () => {
          console.log('EditMainScreen: renderAdddProduct. ');
          props.navigation.navigate('AddProducerScreen');
        }}>
        <View style={GlobalStyles.buttonSmall}>
          <Text style={{fontSize: RFPercentage(3)}}> + </Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
  );

  const renderProductList =  () => (
     <View style={styles.productListContainer}>
          <Text style={styles.title}>상품 리스트</Text>
          <FlatList
            data={productList}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => {
                  startEdit(item);
                }} // Navigate to chat when a user is selected
              >
                <Text style={styles.productName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListHeaderComponent={renderAddProduct} // 리스트 상단에 추가 버튼 배치
            ListEmptyComponent={
              <Text style={styles.emptyMessage}> 리스트 없음.</Text>
            }
          />
     </View>

  );

  const renderProducerList =  () => (
    <View style={styles.productListContainer}>
         <Text style={styles.title}>생산자 리스트</Text>
         <FlatList
           data={producerList}
           keyExtractor={item => item.id}
           renderItem={({item}) => (
             <TouchableOpacity
               style={styles.productItem}
               onPress={() => {
                console.log('EditMainScreen renderProducerList');
                props.navigation.navigate('EditProducerScreen',{item:item});
                //  startEdit(item);
               }} // Navigate to chat when a user is selected
             >
               <Text style={styles.productName}>{item.name}</Text>
             </TouchableOpacity>
           )}
           ListHeaderComponent={renderAddProducer} // 리스트 상단에 추가 버튼 배치
           ListEmptyComponent={
             <Text style={styles.emptyMessage}> 리스트 없음.</Text>
           }
         />
    </View>

 );

  const onPressRight = () => {
      console.log('Profile.tsx onPressRight...');
    //   props.navigation.navigate('SystemInfoScreen');
    };

    // eslint-disable-next-line react/no-unstable-nested-components
    const RightCustomComponent = () => {
      return (
        <TouchableOpacity onPress={onPressRight}>
          <>
            {/* <Text style={styles.leftTextStyle}>홈</Text> */}
            <Icon
              style={{color: colors.lightBlue, fontSize: RFPercentage(5)}}
              name="gear"
            />
          </>
        </TouchableOpacity>
      );
    };

    const renderLists = () => (
      <FlatList
        ListHeaderComponent={
          <>
            {renderProductList()}
            {renderProducerList()}
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
        centerText={strings.EDIT}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={false}
        onPressRight={() => {}}
        isRightView={true}
        rightCustomView={RightCustomComponent}
      />

        {loading ? (
          <LoadingWheel />
        ) : (
          renderLists()
        )}

    </WrapperContainer>
  );
};

const styles = StyleSheet.create({

  productListContainer: {
    padding: 10,
  },
  productItem: {
    padding: RFPercentage(1),
    marginHorizontal: RFPercentage(3),
    marginBottom: 5,
    backgroundColor: colors.grey,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    color: colors.black,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  itemContainer: {
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EditMainScreen;
