/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import {RFPercentage} from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import {useFocusEffect} from '@react-navigation/native';
import GlobalStyles from '../../styles/GlobalStyles';
import {ShippingPostScreenProps} from '../model/types/TShippingNavigator';
import {IDeliveryInfo} from '../model/interface/IDeliveryInfo';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {height, width} from '../../assets/common/BaseValue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Postcode from '@actbase/react-daum-postcode';

const ShippingPostScreen: React.FC<ShippingPostScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);
  const addressInfo = useRef<IDeliveryInfo>();

  useFocusEffect(
    useCallback(() => {
      console.log('ShippingPostScreen : useFocusEffect');
      setLoading(true);
      startLoading();

      return () => {
        setLoading(true);
      };
    }, []),
  );

  const startLoading = async () => {
    setLoading(true);
    const data = await AsyncStorage.getItem('deliveryInfo');
    console.log('ShippingPostScreen data = ', JSON.parse(data!));
    addressInfo.current = JSON.parse(data!);

    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  const onPressLeft = () => {
    props.navigation.navigate('ShippingRegisterScreen');
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
            // transform: [{scaleX: 1.5}], // 폭을 1.5배 넓힘
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
        centerText="주소록"
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
          <ScrollView
            style={GlobalStyles.scrollView}
            keyboardShouldPersistTaps="handled">
            <View
              style={{
                width: width,
                height: height * 0.7,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: RFPercentage(3),
              }}>
              <Postcode
                style={{width: width * 0.8, height: height * 0.6}}
                jsOptions={{animation: false, hideMapBtn: true}}
                onSelected={async (data: any) => {
                  console.log(data.address);

                  const deliveryProfile: IDeliveryInfo = {
                    id: addressInfo.current?.id!,
                    name: addressInfo.current?.name!,
                    phone: addressInfo.current?.phone!,
                    address1: data.address,
                    address2: addressInfo.current?.address2!,
                    checkMark: false,
                    deliveryMethod: addressInfo.current?.deliveryMethod!,
                  };

                  await AsyncStorage.setItem(
                    'deliveryInfo',
                    JSON.stringify(deliveryProfile),
                  );

                  props.navigation.navigate('ShippingRegisterScreen');
                  // Save the delivery info asynchronously
                  // asyncStoreData('deliveryInfo', deliveryProfile)
                  //   .then(() => {
                  //     props.navigation.navigate(returnComponent.current || '');
                  //   })
                  //   .catch((e) => LOG.info(e));
                }}
                onError={function (): void {
                  throw new Error('Function not implemented.');
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </WrapperContainer>
  );
};

// const styles = StyleSheet.create({
//   saveButton: {
//     alignItems: 'center',
//     backgroundColor: '#28a745',
//     padding: 10,
//     borderRadius: 5,
//   },
// });

export default ShippingPostScreen;
