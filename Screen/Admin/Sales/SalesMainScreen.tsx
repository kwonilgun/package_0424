/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import { SalesMainScreenProps } from '../../model/types/TSalesNavigator';
import axios, { AxiosResponse } from 'axios';
import { getToken } from '../../../utils/getSaveToken';
import { baseURL } from '../../../assets/common/BaseUrl';
import { alertMsg } from '../../../utils/alerts/alertMsg';
import strings from '../../../constants/lang';
import LoadingWheel from '../../../utils/loading/LoadingWheel';
import { BarChart, LineChart, lineDataItem } from 'react-native-gifted-charts';
import moment from 'moment';
import { height, width } from '../../../styles/responsiveSize';
import { Picker, PickerIOS } from '@react-native-picker/picker';

// 판매 데이터의 타입을 정의합니다.
interface SalesData {
  date: string; // 날짜
  total_sales: number; // 총 판매액
}

// 판매 데이터의 타입을 정의합니다.
interface SalesMonthlyData {
  month: string; // 날짜
  total_sales: string; // 총 판매액
}

const SalesMainScreen: React.FC<SalesMainScreenProps> = props => {
  const [loading, setLoading] = useState<boolean>(true);
   // 판매 데이터를 상태로 관리합니다.
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [salesMonthly, setSalesMonthly] = useState<SalesMonthlyData[]>([]);
  const [modalSales, setModalSales] = useState<boolean>(false);
  const [modalMonthly, setModalMonthly] = useState<boolean>(false);
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [months, setMonths] = useState<{ label: string; value: string }[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [years, setYears] = useState<{ label: string; value: string }[]>([]);



  useFocusEffect(
    useCallback(() => {
      const newDate = new Date();
      const yearString = String(newDate.getFullYear());
      const monthString = newDate.toISOString().slice(0, 7);
      console.log('SalesMainScreen : useFocusEffect');
      // generateYears();
      // generateMonths();
      fetchSalesData(monthString);
      fetchMonthlyData(yearString);

      return () => {
        setLoading(true);
      };
    }, []),
  );

  useEffect(() => {
    generateYears();
    generateMonths();
  }, []);


  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const yearList = [];

    for (let i = 0; i < 10; i++) {
        const yearValue = currentYear - i;
        const yearLabel = `${yearValue}년`;
        yearList.push({ label: yearLabel, value: String(yearValue) });
    }
    console.log('yearList = ', yearList);

    setYears(yearList);
    setSelectedYear(String(yearList[0].value)); // 기본값 현재 년도
};

const generateMonths = () => {
  const currentDate = new Date();
  const monthList = [];

  for (let i = 0; i < 12; i++) {
      const newDate = new Date(currentDate);
      newDate.setDate(1); // 날짜를 1일로 고정하여 월 변경 시 오류 방지
      newDate.setMonth(currentDate.getMonth() - i);

      // YYYY-MM 형식의 값 설정
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      const monthValue = `${year}-${String(month).padStart(2, '0')}`;
      const monthLabel = `${year}년 ${month}월`;

      monthList.push({ label: monthLabel, value: monthValue });
  }

  console.log('monthList = ', monthList);

  setMonths(monthList);
  setSelectedMonth(monthList[0].value); // 기본값 현재 월
};

   // 컴포넌트가 마운트될 때 API에서 데이터를 가져옵니다.
const fetchSalesData = async (itemValue: string) => {
    setLoading(true);
    try {
          const token = await getToken();
          const [year, month] = itemValue.split('-').map(Number);
          const response: AxiosResponse = await axios.get(
            `${baseURL}sales/summary?month=${month}&year=${year}`,
            {
              headers: {Authorization: `Bearer ${token}`},
            },
          );

          if (response.status === 200 && Array.isArray(response.data)) {
            setSalesData(response.data.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
          } else {
            console.error('Unexpected sales data format:', response.data);
            alertMsg(strings.ERROR, '서버에서 예상치 못한 응답을 받았습니다.');
          }

      }

     catch (error) {
          console.log('SalesMainScreens fetchSalesData error', error);
          alertMsg(strings.ERROR, 'sales 데이터 획득 실패');
    } finally {
          setLoading(false);
    }
  };



  // 컴포넌트가 마운트될 때 API에서 데이터를 가져옵니다.
  const fetchMonthlyData = async (year: string) => {
    try {
          const token = await getToken();
          const response: AxiosResponse = await axios.get(
            `${baseURL}sales/revenue/monthly/${year}`,
            {
              headers: {Authorization: `Bearer ${token}`},
            },
          );

          if(response.status === 200){
            console.log('sales monthly data from AWS', response.data);
            if (Array.isArray(response.data)) {
              const sortedData = response.data.sort(
                (a: SalesMonthlyData, b: SalesMonthlyData) => new Date(a.month).getTime() - new Date(b.month).getTime()
              );
              setSalesMonthly(sortedData);
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

  function formatDateToKorean(dateString: string): string {
    const date = new Date(dateString); // 이미 한국 시간 기준
    const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
    const day = date.getDate();
    // console.log('SalesChartScreen - label = ', `${month}월 ${day}일`);
    return `${month}월 ${day}일`;
  }

  const chartData: lineDataItem[] = salesData
    .map(item => ({
      value: Number(item.total_sales), // Use 'value' for y-axis
      label: formatDateToKorean(item.date), // Example: "Jan 01"
      date: new Date(item.date), // Sorting을 위해 Date 객체 추가
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // 날짜 기준 정렬
    .map(({ date, ...rest }) => rest); // date 필드 제거

  const renderItem = ({ item }: { item: SalesData }) => {
    console.log('salesValue typeof ', typeof item.total_sales);
    const salesValue = typeof item.total_sales === 'number' ? item.total_sales : parseFloat(item.total_sales); // 숫자 유형 확인 및 변환
    const formattedSales =  salesValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 }); // 소수점 제거 및 세 자리마다 쉼표 추가
    // console.log('formattedSales Data = ', formattedSales);
    return (
      <View style={styles.listItem}>
        <Text style={styles.monthText}>{moment(item.date).format('YYYY년 MM월 DD일')}</Text>
        <Text style={styles.profitText}>{formattedSales}원</Text>
      </View>
    );
  };

  const renderMonthlyItem = ({ item }: { item: SalesMonthlyData }) => {

      console.log('salesValue typeof ', typeof item.total_sales);
      const salesValue = typeof item.total_sales === 'number' ? item.total_sales : parseFloat(item.total_sales); // 숫자 유형 확인 및 변환
      const formattedSales =  salesValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 }); // 소수점 제거 및 세 자리마다 쉼표 추가

    return (
      <View style={styles.listItem}>
        <Text style={styles.monthText}>{moment(item.month).format('YYYY년 MM월')}</Text>
        <Text style={styles.profitText}>{formattedSales}원</Text>
      </View>
    );
  };

  const render1MonthSales =  () =>{

    const maxValue = Math.max(...chartData.map(item => item.value ? item.value : 0));

        return (<View style={styles.Container}>
          {/* <Text style={styles.title}>지난 한달 매출</Text> */}
          <Text style={styles.label}>일별 매출</Text>
          <View  style={ Platform.OS === 'android' ?  styles.PickerContainer : styles.IosPickerContainer}>
          {!selectedMonth ? (
            <TouchableOpacity onPress={() => setPickerVisible(true)}>
              <Text>연도를 선택하세요</Text>
            </TouchableOpacity>
          ) : (

            Platform.OS === 'android' ?
            <Text style={{marginTop: RFPercentage(2)}}>{selectedMonth}</Text> : null
          )}
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => {
                console.log('itemValue = ', itemValue);
                setSelectedMonth(itemValue);
                fetchSalesData(itemValue);

              }}
              style={Platform.OS === 'android' ? styles.picker : styles.IosPicker}
              itemStyle={styles.pickerItemStyle} // iOS 스타일 추가
              mode="dialog" // iOS에서 정상적으로 표시되도록 설정

            >
              {months.map((month) => (
                <Picker.Item key={month.value} label={month.label} value={month.value} />
              ))}
            </Picker>
          </View>
          {/* <Text style={styles.selectedText}>선택한 월: {selectedMonth}</Text> */}


          <View style={{marginTop:RFPercentage(3)}} >
                    {/* react-native-svg-charts의 LineChart 컴포넌트를 사용하여 차트를 렌더링합니다. */}
                    <LineChart
                      data={chartData}
                      width={Dimensions.get('window').width - RFPercentage(10)} // Adjust width as needed
                      height={300} // Adjust height as needed
                      maxValue={maxValue < 10000 ? 10000 : maxValue * 1.1} // 최대값을 데이터 최대값보다 약간 크게 설정
                      formatYLabel={(label: string) => {
                        // console.log("maxValue, Y-axis Label: ", maxValue, label); // 콘솔에 label 값 출력
                        // return maxValue < 10000 ? (parseFloat(label) / 1000.0).toFixed(1).toString() : Math.round(parseFloat(label) / 1000.0).toString();
                        return  Math.round(parseFloat(label) / 1000.0).toString();
                      }}

                      yAxisLabelWidth={50}
                      yAxisLabelSuffix="k" // Add prefix to y-axis labels if needed
                      xAxisLabelTextStyle={{
                        rotation: 90, // Rotate x-axis labels by 90 degrees
                        fontSize: 12, // Adjust font size if needed
                        color: 'blue', // Adjust color if needed
                      }}
                      dataPointsColor={'red'} // 데이터 포인트의 색상
                      // showDataPointLabelOnFocus={true}
                      showYAxisIndices={true}
                      showXAxisIndices={true}
                      // showValuesAsDataPointsText={true}
                  />
          </View>
          <TouchableOpacity
                      onPress={() => {
                        console.log('지난 1달 매출 차트 클릭');
                        setModalSales(true);
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>상세 데이타</Text>
          </TouchableOpacity>
    </View>
    );
  };


  const renderMonthlySales =  () => 
    {
      const maxValue = Math.max(...salesMonthly.map(item => item.total_sales ? Number(item.total_sales) : 0));

      return (
    <View style={styles.Container}>
         <Text style={styles.title}>월별 매출</Text>

         <View  style={ Platform.OS === 'android' ?  styles.PickerContainer : styles.IosPickerContainer}>
         {!selectedYear ? (
            <TouchableOpacity onPress={() => setPickerVisible(true)}>
              <Text>연도를 선택하세요</Text>
            </TouchableOpacity>
          ) : (
            Platform.OS === 'android' ? <Text style={{marginTop: RFPercentage(2)}}>{selectedYear}</Text> : null
          )}
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => {
                // console.log('itemValue = ', itemValue);
                setSelectedYear(String(itemValue));
                fetchMonthlyData(String(itemValue));

              }}
              style={Platform.OS === 'android' ? styles.picker : styles.IosPicker}
              itemStyle={{ color: 'black' }} // iOS에서 텍스트가 안 보일 경우 추가
              dropdownIconColor="black" // 안드로이드에서 드롭다운 아이콘 색상

            >

              {years.map((year) => {
                // console.log('PickerOS year', year);
                return (<Picker.Item
                  key={year.value}
                  label={year.label}
                  value={year.value}
                  />
              )})}
            </Picker>
          </View>
          {/* <Text style={styles.selectedText}>선택한 년도: {selectedYear}</Text> */}

          <View style={{marginTop:RFPercentage(3)}} >
              <BarChart
                      data={salesMonthly.map((item, index) => ({
                        label: moment(item.month).format('MMM'),
                        value: Number(item.total_sales),
                        frontColor: index % 2 === 0 ? "green" : "blue", // 짝수 인덱스는 녹색, 홀수 인덱스는 파란색
                        // topLabelComponent: () => (
                        //   <Text style={{ fontSize: 10, color: "black" }}>
                        //     {(item.netProfit / 1000).toFixed(1)}k
                        //   </Text>
                        // ),
                      }))}
                      width={Dimensions.get('window').width - RFPercentage(10)}
                      height={300} // Adjust height as needed
                      barWidth={RFPercentage(2)}
                      frontColor="green"
                      spacing={10}
                      noOfSections={5}
                      yAxisThickness={1}
                      xAxisLabelTextStyle={{ fontSize: 10, color: "black" }}
                      // showValuesAsTopLabel={true}
                      maxValue={maxValue < 10000 ? 10000 : maxValue * 1.1} // 최대값을 데이터 
                      formatYLabel = {(label:string)=> Math.round(parseFloat(label) / 1000.0).toString()}
                      yAxisLabelWidth={50}
                      yAxisLabelSuffix="k" // Add prefix to y-axis labels if neede

                  />
          </View>

          <TouchableOpacity
                      onPress={() => {
                        console.log('월별 매출 차트 클릭');
                        setModalMonthly(true);
                      }}
                      style={styles.saveButton}>
                      <Text style={styles.buttonText}>상세 데이타</Text>
          </TouchableOpacity>
    </View>
)};


  const renderLists = () => (
        <FlatList
          ListHeaderComponent={
            <>
              {render1MonthSales()}
              {renderMonthlySales()}
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
        centerText= "판매 분석"
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={false}
        onPressRight={() => {}}
        isRightView={false}
        // rightCustomView={RightCustomComponent}
        rightText=''
      />

      {loading ? (
              <LoadingWheel />
            ) : (
              <>
                  {renderLists()}
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalSales}
                    onRequestClose={() => setModalSales(false)}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        {/* 총 매출 표시 */}
                        <Text style={styles.totalSalesText}>
                            총 매출: {salesData.reduce((sum, item) => sum + Number(item.total_sales), 0).toLocaleString()}원
                        </Text>

                        <View style={styles.subtitleHeader}>
                              <Text style={styles.titleDate}>날짜</Text>
                              <Text style={styles.titleRevenue}>매출</Text>
                        </View>
                        <FlatList
                            data={salesData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.date ?? Math.random().toString()}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={
                              <Text style={styles.emptyMessage}> 리스트 없음.</Text>
                            }
                        />
                        <Button title="닫기" onPress={() => setModalSales(false)} />
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalMonthly}
                    onRequestClose={() => setModalMonthly(false)}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        {/* 총 매출 표시 */}
                        <Text style={styles.totalSalesText}>
                            총 매출: {salesMonthly.reduce((sum, item) => sum + Number(item.total_sales), 0).toLocaleString()}원
                        </Text>

                        <View style={styles.subtitleHeader}>
                              <Text style={styles.titleDate}>날짜</Text>
                              <Text style={styles.titleRevenue}>월별 매출</Text>
                        </View>
                        <FlatList
                            data={salesMonthly}
                            renderItem={renderMonthlyItem}
                            keyExtractor={(item) => item.month ?? Math.random().toString()}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={
                                          <Text style={styles.emptyMessage}> 리스트 없음.</Text>
                                        }
                        />
                        <Button title="닫기" onPress={() => setModalMonthly(false)} />
                      </View>
                    </View>
                  </Modal>
              </>
        )}


    </WrapperContainer>
  );
};

export const styles = StyleSheet.create({
  Container: {
    padding: RFPercentage(2),
    // justifyContent: 'center',
    // alignItems: 'center',
    borderWidth: 1,
    borderColor: 'blue',
  },

  pickerItemStyle: { // iOS에서 텍스트 색상 스타일
    color: 'black',
  },

  PickerContainer: {
    // width: '70%',
    height: RFPercentage(6),
    marginLeft: RFPercentage(2),
    paddingHorizontal: RFPercentage(2),
    borderColor: 'black', // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 10, // 테두리 둥글기

  },
  IosPickerContainer: {
    height: RFPercentage(8),
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    // width: width * 0.7, // 너비를 제한
    overflow: 'hidden', // 내용이 넘치지 않도록
  },
  picker: {
    height: RFPercentage(4),
    marginTop: RFPercentage(-3),
    width: '100%',
    alignItems: 'center',
    alignContent: 'center',
  },

  IosPicker: {
    height: RFPercentage(2),
     marginTop: RFPercentage(-8),
    marginLeft: RFPercentage(2),
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: RFPercentage(1),
  },
  

  selectedText: {
    marginTop: RFPercentage(0.5),
    fontSize: 16,
    color: 'blue',
  },

  modalContainer: {
      flex: 1,
      flexDirection: 'column',
      // width: width * 0.9,
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      height: 'auto',
      backgroundColor: 'white',
      padding: RFPercentage(1),
      borderRadius: 10,
      alignItems: 'center',
    },

    totalSalesText: {
      fontSize: RFPercentage(2),
      fontWeight: 'bold',
      color: 'black',
      marginBottom: RFPercentage(0.5),
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  subtitleHeader: {
    flexDirection: 'row',
    width: width * 0.8,
    marginTop: RFPercentage(2),
    justifyContent: 'center',
    alignItems: 'center',
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
        width: width * 0.8,
        justifyContent: 'space-between',
        paddingVertical: RFPercentage(0.5),
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
    // fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  saveButton: {
    width: 'auto',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    margin: RFPercentage(2),
    paddingVertical: RFPercentage(0.5),
    paddingHorizontal: RFPercentage(4),
    borderRadius: RFPercentage(1),
  },
  buttonText: {
      fontWeight: 'bold',
      fontSize: RFPercentage(2),
      color: colors.white,
    },
});

export default SalesMainScreen;
