/* eslint-disable react-native/no-inline-styles */
/*
 * File: ProductCard.tsx
 * Project: my-app
 * File Created: Saturday, 28th January 2023 2:56:54 pm
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Thursday, 2nd February 2023 1:19:24 pm
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2023 루트원 AI, 루트원 AI
 * -----
 * 2023-02-02 : CachedImage를 추가했다. image caching 을 구현했다.
 * 2023-05-03 : FastImage 수정: 웹 서버를 통해서 S3에 있는 이미지 파일을 가져온다. public에서 가져오는 것이 아니고 웹 서버를 통해서 이미지를 가져온다.
 * 2024-12-20 : package market로 변경
 */

import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Button, Modal, Platform } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
// import {baseURL} from '../../assets/common/baseUrl';
import { baseURL } from '../../assets/common/BaseUrl';
import isEmpty from '../../utils/isEmpty';
import * as actions from '../../Redux/Cart/Actions/cartActions';
import { IProduct } from '../model/interface/IProductInfo';
import { width } from '../../assets/common/BaseValue';
import { StackNavigationProp } from '@react-navigation/stack';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { CartItem } from '../../Redux/Cart/Reducers/cartItems';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { ProductCardProps } from '../model/types/TUserNavigator';



const ProductCard: React.FC<ProductCardProps> = props => {
  //   const {name, price, image, discount} = props;

  const [showDetail, setShowDetail] = useState<string[] | null>(null);
  const [modalDetail, setModalDetail] = useState<boolean>(false);

  const imageName = props.items.image!.split('/').pop() || '';

  const fetchProductDetails = async (productName: string, detail: boolean): Promise<void> => {
    props.onLoadingChange(true);
    const token = await getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
    };

    let response: AxiosResponse;

    try {
      if(detail){
        response = await axios.get(
          `${baseURL}gemini/productDetails/${productName}`,
          config
        );
      }
      else {
        response = await axios.get(
          `${baseURL}gemini/productSummary/${productName}`,
          config
        );
      }
      if (response.status === 200 && response.data.length > 0) {
        setShowDetail(response.data);
      } else {
        console.log("데이터 없음");
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
     props.onLoadingChange(false);
     setModalDetail(true); // 데이터가 있을 때만 모달 열기
    }
  };

  React.useEffect(() => {
    // console.log("Modal 상태 변경:", modalDetail);
  }, [modalDetail]);

  return (
    <>
      <View style={styles.cardContainer}>
        <FastImage
          style={styles.image}
          source={{
            uri: imageName
              ? `${baseURL}products/downloadimage/${imageName}`
              : undefined,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View style={{ flexDirection: 'row' }}>
          {showPriceInform(5, props.items.name, Number(props.items.discount), Number(props.items.price))}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
              console.log('요약 보기');
              fetchProductDetails(props.items.name, false);
              }}>
              <Text style={styles.textButton}>요약</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => fetchProductDetails(props.items.name, true)}>
              <Text style={styles.textButton}>상세</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetail}
        onRequestClose={() => setModalDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={showDetail}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text>{item || '데이터 없음'}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyMessage}>리스트 없음.</Text>
              }
            />
            <Button title="닫기" onPress={() => setModalDetail(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (props: any, dispatch: any) => {
  return {
    addItemToCart: () =>
      dispatch(actions.addToCart({quantity: 1, product: props.items})),
  };
};

export default connect(null, mapDispatchToProps)(ProductCard);

export function showPriceInform(
  marginLeft: number,
  name: string,
  discount?: number,
  price?: number,
) {
  return (
    <View style={[styles.infoContainer, {marginLeft}]}>
      <Text style={styles.productName}>
        {name.length > 15 ? name.substring(0, 12) + '...' : name}
      </Text>

      <View style={styles.priceContainer}>
        <Text style={styles.discountText}>
          {discount ? `${discount}% ` : ''}
        </Text>

        {!isEmpty(discount) ? (
          <Text style={styles.strikeThroughText}>
            {price?.toLocaleString('kr-KR')}원
          </Text>
        ) : (
          <Text style={styles.normalPriceText}>
            {price?.toLocaleString('kr-KR')}원
          </Text>
        )}
      </View>

      {!isEmpty(discount) ? (
        <Text style={styles.finalPriceText}>
          {((price || 0) * (100 - (discount || 0)) * 0.01).toLocaleString(
            'kr-KR',
          )}{' '}
          원
        </Text>
      ) : null}

      <Text style={styles.freeShippingText}>무료배송</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: Platform.OS === 'ios' ? RFPercentage(30) : RFPercentage(32),
    width: Platform.OS === 'ios' ? width * 0.9 : width * 0.92,
    borderWidth: 1,
    borderColor: 'green',
    padding: 4,
    borderRadius: 10,
    marginBottom: RFPercentage(1),
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    width:  Platform.OS === 'ios' ? RFPercentage(40) : RFPercentage(42),
    height: RFPercentage(20),
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 4,
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    color: 'red',
    fontSize: 14,
  },
  strikeThroughText: {
    textDecorationLine: 'line-through',
    fontSize: 14,
  },
  normalPriceText: {
    fontSize: 14,
  },
  finalPriceText: {
    fontSize: 14,
  },
  freeShippingText: {
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    // width: width * 0.9,
    // height: height * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: 'auto',
    backgroundColor: 'white',
    marginVertical: RFPercentage(10),
    padding: RFPercentage(1),
    borderRadius: 10,
    alignItems: 'center',
  },

  textButton: {
     color: 'black',
     padding: RFPercentage(0.5),
     marginHorizontal: RFPercentage(1),
     borderColor: 'blue',
     borderWidth: 1,
     borderRadius: RFPercentage(0.5),
  },

  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
