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

const ProductMainScreen: React.FC<ProductMainScreenProps> = props => {
  const {state} = useAuth();

  const [products, setProducts] = useState<IProduct[] | []>([]);
  const [productsCtg, setProductsCtg] = useState<IProduct[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  // const [productListLoading, setProductListLoading] = useState<boolean>(false); // ProductList 로딩 상태 추가

  const [companyInform, setCompanyInform] = useState<ICompany | null>(null);
  const [productNames, setProductNames] = useState<string[] | null>(null);


  const initialState = useRef<IProduct[]>([]);

  const isAdmin = state.user?.isAdmin;

  useFocusEffect(
    useCallback(() => {
      // console.log('1. ProductMainScreen : useFocusEffect... 진입');
      if (state.isAuthenticated) {
        fetchProductInformFromServer();
      } else {
        // console.log('ProductMainScreen useFocusEffect: 로그 아웃상태');
        setLoading(false);
      }

      return () => {
        // console.log('ProductMainScreen useFocusEffect 나감');
        setProducts([]);
        setLoading(true);
      };
    }, [state.isAuthenticated]),
  );

  const fetchProductInformFromServer = async () => {
    try {
      const token = await getToken();
      //헤드 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };

      const productResponse: AxiosResponse = await axios.get(
        `${baseURL}products/`,
        config,
      );
      setProducts(productResponse.data);

      setProductsCtg(productResponse.data);
      initialState.current = productResponse.data;

      // product name 만 추출
      const productNames = productResponse.data.map((product: IProduct) => product.name);
      console.log('ProductMainScreen Product Names:', productNames);
      setProductNames(productNames);

      //3. 회사 정보를 가져온다.
      const companyResponse: AxiosResponse = await axios.get(
        `${baseURL}terms/${COMPANY_INFO_ID}`,
      );
      if (companyResponse.status === 200) {
        setCompanyInform(companyResponse.data[0]);
      } else {
        setCompanyInform(null);
      }
    } catch (error) {
      console.log('fetProductInformFromServer 에러..', error);
    } finally {
      setLoading(false);
    }
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
        style={GlobalStyles.containerKey}>
        {loading  ? (
          <>
            <LoadingWheel />
          </>
        ) : (
          <>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={styles.background}>

              <View>
                {loading && <LoadingWheel/>}

                {productsCtg.length > 0 ? (
                  <View style={styles.productsContainer}>
                    {productsCtg.map(item => (
                      <ProductList
                        navigation={props.navigation}
                        key={item.name}
                        item={item}
                        companyInform={companyInform!}
                        onLoadingChange={handleProductListLoadingChange} // 콜백 함수 전달

                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.noProductsContainer}>
                    <Text style={styles.noProductsText}>해당 제품이 없음</Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* <TermsMain
                  companyInform={companyInform}
                  navigation={props.navigation}
                /> */}
              </View>

          </ScrollView>
       
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
  background: {
    backgroundColor: '#f2f2f2',
    height: height,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  marginText: {
    margin: 10,
  },
  phoneNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  searchResultContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#87ceeb',
  },
  productsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  noProductsContainer: {
    height: height * 0.2,
    backgroundColor: '#dcdcdc',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 20,
  },
  divider: {
    marginTop: 20,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#87ceeb',
    borderRadius: 10,
    // width: SEARCH_BOX_WIDTH,
  },
  textInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#00bfff',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
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
