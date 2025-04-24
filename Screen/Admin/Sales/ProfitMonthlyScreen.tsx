/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';
import {
  Dimensions, FlatList, StyleSheet, Text, TouchableOpacity,
  View
} from 'react-native';
import WrapperContainer from '../../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';

import LoadingWheel from '../../../utils/loading/LoadingWheel';

import axios, { AxiosResponse } from 'axios';

import { BarChart, LineChart, lineDataItem} from 'react-native-gifted-charts'; // Import necessary types

import { baseURL } from '../../../assets/common/BaseUrl';


import { getToken } from '../../../utils/getSaveToken';
import { ProfitMonthlyScreenProps, SalesChartScreenProps, SalesMonthlyScreenProps } from '../../model/types/TSalesNavigator';
import { alertMsg } from '../../../utils/alerts/alertMsg';
import strings from '../../../constants/lang';
import moment from 'moment';
import { ScrollView } from 'react-native-gesture-handler';
import { width } from '../../../styles/responsiveSize';


// 판매 데이터의 타입을 정의합니다.
interface ProfitData {
  month: string
  totalRevenue: number,
  platformFee: number,
  netProfit: number,
}

const ProfitMonthlyScreen: React.FC<ProfitMonthlyScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);

  // 판매 데이터를 상태로 관리합니다.
  const [profitData, setProfitData] = useState<ProfitData[]>([]);


  useFocusEffect(
    useCallback(() => {
      console.log('ProfitMonthlyScreen : useFocusEffect');
      fetchSalesData();
    }, []),
  );

  // 컴포넌트가 마운트될 때 API에서 데이터를 가져옵니다.
  const fetchSalesData = async () => {
    try {
          const token = await getToken();
          const response: AxiosResponse = await axios.get(
            `${baseURL}sales/profit/monthly`,
            {
              headers: {Authorization: `Bearer ${token}`},
            },
          );

          if(response.status === 200){
            console.log('profit monthly data from AWS', response.data);
            if (Array.isArray(response.data)) {
              setProfitData(response.data);
            } else {
              console.error('Unexpected sales data format:', response.data);
              alertMsg(strings.ERROR, '서버에서 예상치 못한 응답을 받았습니다.');
            }
          }

      }

     catch (error) {
          console.log('SalesCharScreens fetchSalesData error', error);
          alertMsg(strings.ERROR, 'sales 데이터 획득 실패');
    } finally {
          setLoading(false);
    }
  };


  const onPressLeft = () => {
    props.navigation.navigate('SalesMainScreen');
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

  // const chartData: lineDataItem[] = profitData.map(item => ({
  //   value: item., // Use 'value' for y-axis
  //   label: moment(item.month).format('MMM'), // Example: "Jan 01"
  //   // label: item.date.substring(5),      // Use 'label' for x-axis (or keep it as date if needed)
  //   // ... other lineDataItem properties as needed (e.g., color, etc.)
  // }));
  const renderItem = ({ item }: { item: ProfitData }) => (
    <View style={styles.listItem}>
      <Text style={styles.monthText}>{moment(item.month).format('YYYY년 MM월')}</Text>
      <Text style={styles.profitText}>{item.netProfit.toLocaleString()}원</Text>
    </View>
  );
  

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText="월별 순매출"
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
        <View style={styles.barContainer} >
          {/* react-native-svg-charts의 LineChart 컴포넌트를 사용하여 차트를 렌더링합니다. */}
          <BarChart
                    data={profitData.map((item, index) => ({
                      label: moment(item.month).format('MMM'),
                      value: item.netProfit,
                      frontColor: index % 2 === 0 ? "green" : "blue", // 짝수 인덱스는 녹색, 홀수 인덱스는 파란색
                      // topLabelComponent: () => (
                      //   <Text style={{ fontSize: 10, color: "black" }}>
                      //     {(item.netProfit / 1000).toFixed(1)}k
                      //   </Text>
                      // ),
                    }))}
                    width={Dimensions.get('window').width - RFPercentage(15)}
                    barWidth={RFPercentage(2)}
                    frontColor="green"
                    spacing={10}
                    noOfSections={5}
                    yAxisThickness={0}
                    xAxisLabelTextStyle={{ fontSize: 10, color: "black" }}
                    // showValuesAsTopLabel={true}
                    maxValue={10000}
                    formatYLabel = {(label:string)=> Math.round(parseFloat(label) / 1000.0).toString()}
                    yAxisLabelWidth={30}
                    yAxisLabelSuffix="k" // Add prefix to y-axis labels if neede

                />
                <View style={styles.subtitleHeader}>
                    <Text style={styles.titleDate}>날짜</Text>
                    <Text style={styles.titleRevenue}>순매출</Text>
                </View>
                <FlatList
                  data={profitData}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.month}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                                <Text style={styles.emptyMessage}> 리스트 없음.</Text>
                              }
              />
        </View>
      )}
    </WrapperContainer>
  );
};

export const styles = StyleSheet.create({
    barContainer: {
      width: width * 0.9,
      marginTop:RFPercentage(5), 
      marginHorizontal:RFPercentage(1), 
      alignSelf:'center', 
      padding:RFPercentage(2),

    },
    subtitleHeader: {
      flexDirection: 'row',
      marginLeft: RFPercentage(2),
      // justifyContent: 'center',
      marginTop: RFPercentage(2),
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
      marginTop: RFPercentage(0.1),
      paddingHorizontal: RFPercentage(2),
      paddingBottom: RFPercentage(5),
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
});

export default React.memo(ProfitMonthlyScreen);