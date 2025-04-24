import React, {useCallback, useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {Modalize} from 'react-native-modalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosResponse} from 'axios';
import isEmpty from '../../utils/isEmpty';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {baseURL} from '../../assets/common/BaseUrl';
import {height} from '../../assets/common/BaseValue';
import {CartItem} from '../../Redux/Cart/Reducers/cartItems';
import {IProducerInfo, IUserAtDB} from '../model/interface/IAuthInfo';
import GlobalStyles from '../../styles/GlobalStyles';
import {errorAlert} from '../../utils/alerts/errorAlert';
import strings from '../../constants/lang';
import {getToken} from '../../utils/getSaveToken';

// import isEmpty from '../../../../assets/common/isEmpty';
// import { LoadingWheel } from '../../../../Shared/Loading/LoadingWheel';
// import { baseURL } from '../../../../assets/common/baseUrl';

// const modalHeight = height * 0.3;

type Props = {
  modalRef: React.RefObject<Modalize>;
  item: CartItem;
  transMoney: string;
  dProps?: any;
};

const TransferSheet: React.FC<Props> = ({modalRef, item, transMoney}) => {
  const [producerInfo, setProducerInfo] = useState<IProducerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      if (!isEmpty(item?.product?.producer_id)) {
        console.log('producer Id =  ', item.product.producer_id);
        fetchProducerInform(item.product.producer_id!);
      }
    }, [item]),
  );


  async function fetchProducerInform(producer_Id: string,) {
    try {
      const token = await getToken();
      // console.log('TransferSheet userId =', userId);
      const response: AxiosResponse = await axios.get(
        `${baseURL}producers/${producer_Id}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      console.log('TransferSheet response = ', response.status);

      if (response.status === 200) {
        console.log(
          'TransferSheet.tsx: 유저 데이터 정상적으로 가져옴 data = ',
          response.data,
        );
        setProducerInfo(response.data[0]);
      } else if (response.status === 202) {
        console.log('생산자 정보 없음 ', response.data);
        setProducerInfo(response.data);
        errorAlert(strings.ERROR, '생산자 정보가 없음.');
      } else {
        console.log('생산자 정보 없음... data =');
      }
    } catch (error) {
      console.log('TransferSheet.tsx: 데이터 가져오지 못함', error);
      errorAlert(strings.ERROR, '생산자 정보를 가져오지 못함.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modalize
      ref={modalRef}
      snapPoint={height * 0.4}
      adjustToContentHeight={true}>
      {loading === false ? (
        <View style={styles.container}>
          <Text style={styles.text}>생산자 이름: {producerInfo?.name}</Text>
          <Text style={styles.text}>은행 이름: {producerInfo?.bankName}</Text>
          <Text style={styles.text}>계좌 번호: {producerInfo?.bankNumber}</Text>
          <Text style={styles.text}>송금할 금액: {transMoney}원</Text>
          <TouchableOpacity
            onPress={() => {
              modalRef.current?.close();
            }}>
            <View style={GlobalStyles.buttonSmall}>
              <Text style={GlobalStyles.buttonTextStyle}>close</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <LoadingWheel />
      )}
    </Modalize>
  );
};


const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 8,
    backgroundColor: '#E0E0E0',
  },
  text: {
    marginTop: 4,
    padding: 8,
    borderColor: '#BDBDBD',
    borderWidth: 1,
    fontSize: 14,
  },
});

export default TransferSheet;
