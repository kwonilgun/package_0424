/* eslint-disable @typescript-eslint/no-shadow */
/*
 * File: ProductMainScreen.tsx
 * Project: market_2024_12_13
 * File Created: Thursday, 19th December 2024 10:20:25 am
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Thursday, 19th December 2024 10:19:11 pm
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 * 2024-12-19 : 생성
 */

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */

import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { ProductMainScreenProps } from '../model/types/TUserNavigator';
import { RFPercentage } from 'react-native-responsive-fontsize';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { useAuth } from '../../context/store/Context.Manager';
import { useFocusEffect } from '@react-navigation/native';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import { COMPANY_INFO_ID, height } from '../../assets/common/BaseValue';
import GlobalStyles from '../../styles/GlobalStyles';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { getToken } from '../../utils/getSaveToken';
import { IProduct } from '../model/interface/IProductInfo';
import { ICompany } from '../model/interface/ICompany';
import ProductList from './ProductList';
import strings from '../../constants/lang';
import { ISProduct } from '../Admin/AddProductScreen';
import { alertMsg } from '../../utils/alerts/alertMsg';
import colors from '../../styles/colors';
import ProductCard from './ProductCard';

interface IPackagedProducts {
  [packageName: string]: ISProduct[];
}

const ProductMainScreen: React.FC<ProductMainScreenProps> = props => {
  const {state} = useAuth();

  const [productList, setProductList] = useState<ISProduct[] | []>([]);
  const [packagedProducts, setPackagedProducts] = useState<IPackagedProducts>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  // const [productListLoading, setProductListLoading] = useState<boolean>(false); // ProductList 로딩 상태 추가

  const [companyInform, setCompanyInform] = useState<ICompany | null>(null);
  const [productNames, setProductNames] = useState<string[] | null>(null);


  const initialState = useRef<ISProduct[]>([]);

  const isAdmin = state.user?.isAdmin;

  useFocusEffect(
    useCallback(() => {
      // console.log('1. ProductMainScreen : useFocusEffect... 진입');
      // if (state.isAuthenticated) {
      //   fetchProductInformFromServer();
      // } else {
      //   // console.log('ProductMainScreen useFocusEffect: 로그 아웃상태');
      //   setLoading(false);
      // }
      fetchProductList();

      return () => {
        // console.log('ProductMainScreen useFocusEffect 나감');
        setProductList([]);
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
        // console.log('products List  = ', response.data);
        const productL = response.data as ISProduct[];
        productL.sort((a,b) => a.name.localeCompare(b.name));
        setProductList(productL);
        groupProductsByPackage(productL);

      }
    } catch (error) {
      alertMsg(strings.ERROR, '상품 리스 다운로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const groupProductsByPackage = (products: ISProduct[]) => {
    const grouped: IPackagedProducts = {};
    products.forEach(product => {
      if (product.package) {
        if (!grouped[product.package]) {
          grouped[product.package] = [];
        }
        grouped[product.package].push(product);
      }
    });
    // console.log('grouped package = ', grouped);
    setPackagedProducts(grouped);
  };


  const onPressRight = () => {
    console.log('Ai magic click');
    props.navigation.navigate('HomeAiScreen', {productNames: productNames});
  };

  const handleProductListLoadingChange = (isLoading: boolean) => {
    setAiLoading(isLoading);
  };

  const RightCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressRight}>
      <View
        style={{
          width: RFPercentage(4),
          height: RFPercentage(4),
          borderRadius: RFPercentage(5) / 2, // 원형
          borderColor: 'black',
          borderWidth: 2,
          backgroundColor: 'white', // 배경색
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: RFPercentage(2), color: 'black', fontWeight: 'bold' }}>
          Q/A
        </Text>
      </View>
    </TouchableOpacity>
    );
  };


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

                  console.log('list item click....');

                  props.navigation.navigate('ProductDetailScreen', {
                    item: item,
                    companyInform: companyInform,
                  });
                }}
                // Navigate to chat when a user is selected
              >
                <Text style={styles.productName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            // ListHeaderComponent={renderAddProduct} // 리스트 상단에 추가 버튼 배치
            ListEmptyComponent={
              <Text style={styles.emptyMessage}> 리스트 없음.</Text>
            }
          />
      </View>

  );

  const renderPackagedProductList = (packageName: string, products: ISProduct[]) => (
    <View style={styles.packageContainer} key={packageName}>
      <Text style={styles.packageTitle}>{packageName}-패키지</Text>
      {products.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.packagedProductItem}
          onPress={() => {
            console.log('packaged item click....');
            props.navigation.navigate('ProductDetailScreen', {
              item: item,
              companyInform: companyInform,
            });
          }}
        >
          <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
              <Text style={[styles.headerText, {width:RFPercentage(20),  marginLeft: RFPercentage(2)}]}>{item.name}</Text>
              <Text style={[styles.headerText, {width:RFPercentage(10)  }]}>{item.unitDesc}</Text>
              <Text style={[styles.headerText, {width:RFPercentage(10) }]}>{item.price.toString().split('.')[0]}원</Text>
          </View>
          
          
        </TouchableOpacity>
      ))}
    </View>
  );


  const renderLists = () => (
        <FlatList
          ListHeaderComponent={
            <>
              {/* {renderProductList()} */}
              {Object.keys(packagedProducts).map(packageName => (
                renderPackagedProductList(packageName, packagedProducts[packageName])
              ))}
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
        centerText={ state.user?.isAdmin ? '홈(관리자)' :  strings.HOME}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={false}
        isRightView={isAdmin ? false : true}
        isRight = {false}
        rightCustomView={RightCustomComponent}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex:1, marginTop: RFPercentage(2)}}>
        {loading  ? (
          <>
            <LoadingWheel />
          </>
        ) : (
          <>

          {loading ? (
              <LoadingWheel />
              ) : (
              renderLists()
          )}

          {/* 최상위 Layer에서 LoadingWheel 표시 */}
          {aiLoading && (
            <View style={styles.loadingOverlay}>
              <LoadingWheel />
            </View>
          )}
          </>
       )}
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({

  headerText: {
    // flex: 1, // 동일한 비율 유지
    fontSize: RFPercentage(2),
    color: 'black',
    // fontWeight: 'bold',
    textAlign: 'center',
  },

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

    packageContainer: {
      padding: 10,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'gray',
    },
    packageTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10,
      color: 'black',
    },
    packagedProductItem: {
      // padding: RFPercentage(1),
      // marginHorizontal: RFPercentage(3),
      marginBottom: 5,
      backgroundColor: colors.grey,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.grey,
    },
    packagedProductName: {
      fontSize: 16,
      color: colors.black,
    },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // 가장 위에 표시
  },
});

export default ProductMainScreen;
