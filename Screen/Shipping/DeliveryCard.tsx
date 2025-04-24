/* eslint-disable react-native/no-inline-styles */
/*
 * File: DeliveryCard.tsx
 * Project: market_2024_12_13
 * File Created: Monday, 23rd December 2024 8:58:44 pm
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Tuesday, 24th December 2024 7:19:41 am
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

import deliveries from '../../assets/json/deliveries.json';
import {confirmAlert} from '../../utils/alerts/confirmAlert';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {returnDashNumber} from '../../utils/insertDashNumber';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStyles from '../../styles/GlobalStyles';
import {IDeliveryInfo} from '../model/interface/IDeliveryInfo';
import CheckBox from '@react-native-community/checkbox';
import {RFPercentage} from 'react-native-responsive-fontsize';

interface DeliveryCardProps {
  name: string;
  address1: string;
  address2: string;
  phone: string;
  deliveryMethod: number;
  id: string;
  checkMark: boolean;
  deliveryList: IDeliveryInfo[];
  index: number;
  setDeliveryList: (list: IDeliveryInfo[]) => void;
  navigation: any;
}

const DeliveryCard: React.FC<DeliveryCardProps> = props => {
  const {
    name,
    address1,
    address2,
    phone,
    deliveryMethod,
    id,
    checkMark,
    deliveryList,
    index,
    setDeliveryList,
  } = props;

  const [chkValue, setChkValue] = useState(false);
  const displayCheck = deliveryList[index].checkMark;

  const deliveryProfile = {
    name,
    address1,
    address2,
    phone,
    deliveryMethod,
    id,
    checkMark,
  };

  useEffect(() => {
    console.log('DeliveryCard useEffect');
    setChkValue(displayCheck);
  }, [displayCheck]);

  const modifyDeliveryInform = async () => {
    await AsyncStorage.setItem('deliveryInfo', JSON.stringify(deliveryProfile));
    props.navigation.navigate('DeliveryModifyScreen');
  };

  const onChangeMark = (state: boolean) => {
    console.log('DeliveryCard.tsx: onChange State = ', state);
    deliveryList[index].checkMark = state;
    setChkValue(state);
    setDeliveryList(deliveryList);
  };

  function changeCheckValue(state: boolean) {
    console.log('DeliveryCard.tsx: Checkbox state = ', state);
    onChangeMark(state);
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{name}</Text>

        <TouchableOpacity
          style={{
            height: RFPercentage(4),
            width: RFPercentage(4),
            borderWidth: 1,
            borderColor: 'black',
            backgroundColor: chkValue ? 'transparent' : 'transparent',
          }}
          onPress={() => changeCheckValue(!chkValue)}>
          {/* 2025-04-18 10:35:41, sql 서버로 변경하면서 chkValue가 false 대신에 0으로 온다. 이부분을 Boolean으로 변경을 해 주여야 한다.  */}
          {Boolean(chkValue) && (
            <Text
              style={{
                padding: RFPercentage(1),
                textAlign: 'center',
                color: Platform.OS === 'ios' ? 'white' : 'black',
              }}>
              {'\u2714'}  {/* ✔의 유니코드 */}
            </Text>
          )}
        </TouchableOpacity>

      </View>
      <View style={styles.addressContainer}>
        <Text style={styles.address}>
          주소: {address1}-{address2}
        </Text>
      </View>
      <Text style={styles.phone}>전화: {returnDashNumber(phone)}</Text>
      <View style={styles.footerContainer}>
        <Text style={styles.deliveryMethod}>
          {deliveryMethod
            ? deliveries[deliveryMethod].name
            : deliveries[0].name}
        </Text>
        <TouchableOpacity
          onPress={() => {
            console.log('DeliveryCard.tsx: Editing address');
            modifyDeliveryInform();
          }}>
          <FontAwesome
            name="edit"
            style={{
              fontSize: RFPercentage(5),
              color: 'grey',
              marginRight: -RFPercentage(1),
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    marginHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  address: {
    fontSize: 14,
  },
  phone: {
    fontSize: 14,
    marginVertical: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryMethod: {
    fontSize: 14,
  },
  editIcon: {
    color: 'gray',
    fontSize: RFPercentage(4),
  },
});

export default DeliveryCard;
