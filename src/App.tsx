import React, { Component, PureComponent } from 'react';
import { Text, Dimensions, StyleSheet, View, Image, StatusBar, PanResponder } from 'react-native';
import { createBottomTabNavigator, createDrawerNavigator } from 'react-navigation';
import Home from './containers/Home';
import Settings from './containers/Settings';

//import { PinchGestureHandler } from 'react-native-gesture-handler';


import {boundMethod} from 'autobind-decorator'
import axios from 'axios';
import { ViewPager } from 'react-native-viewpager-carousel';
//import PinchZoomImage from 'react-native-pinch-zoom-image';

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
//import ReactNativeZoomableView from 'react-native-zoomable-view';

import { getImagesArray, getChapterArray, getValueByKey} from './utils/comicUtils';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

const ROOT_URL = 'https://comic-editor.s3.eu-north-1.amazonaws.com/'

const comic_name = 'One Piece - Digital Colored Comics';
//const chapter_name = 'Vol.28 Ch.0263 - Pirate Nami and the Sky Knight vs. Vice Captains Hotori and Kotori (gb) [PowerManga]';

//const chapter_name = 'Vol.33 Ch.0308 - Obstacle Warfare (gb) [PowerManga]'
const w = Dimensions.get('window')


class App extends Component {
  static navigationOptions = {
    title: 'Home Screen',
    header: null,
  };

  state = {
    parentState: 'testing testing',
    data: undefined,
    data_loaded: false,
    pages_data: undefined,
    pages_data_loaded: false,
    comic_data: undefined,
    comic_data_loaded: false,

    chapters_arr: [],

    img_arr: [],
    prev_img_arr: [],
    next_img_arr: [],

    comic_name: comic_name,
    chapter_nr: 308,
    chapter_name: undefined,

    page_nr: number = 1,
  }

  constructor(props) {
    super(props)
    this.loadComic()

    this._renderPage = this._renderPage.bind(this)
    this._onPageChange = this._onPageChange.bind(this)
    this.prevPage = this.prevPage.bind(this)
    this.nextPage = this.nextPage.bind(this)

    this.changePage = this.changePage.bind(this)

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => false,
      onPanResponderRelease: ({nativeEvent: { touches } }, { x0, y0, moveX }) => {
        const centerX = Dimensions.get('window').width / 2
        console.warn('Change Page')
        if (x0 - 60 > centerX) {
          this.prevPage()
        } else if (x0 + 60 < centerX) {
          this.nextPage()
        }
      }

    })
  }

  changePage(new_page_nr) {

    /*
    if(new_page_nr <= 0) {
      new_page_nr = this.state.prev_img_arr.length
      let new_chapter_nr = this.state.chapter_nr - 1

      console.assert(new_chapter_nr > 0) //TODO:

      this.loadPages(chapter_nr=new_chapter_nr)

      this.setState({
        page_nr: new_page_nr,
        chapter_nr: new_chapter_nr,

        img_arr: this.state.prev_img_arr,
        prev_img_arr: [],
        next_img_arr: this.state.img_arr,
      })


    } else if(new_page_nr >= this.state.img_arr) {
      new_page_nr = 1
      let new_chapter_nr = this.state.chapter_nr + 1

      console.assert(new_chapter_nr < this.state.chapters_arr.length) //TODO:

      this.loadPages(chapter_nr=new_chapter_nr)

      this.setState({
        page_nr: new_page_nr,
        chapter_nr: new_chapter_nr,

        img_arr: this.state.next_img_arr,
        prev_img_arr: this.state.img_arr,
        next_img_arr: [],
      })

    }
    */
    this.viewPager.scrollToIndex(new_page_nr)
  }

  prevPage() {
    this.changePage(this.state.page_nr - 1)
  }
  nextPage() {
    this.changePage(this.state.page_nr + 1)
  }


  refreshPages(page_nr=undefined) {
    if(page_nr === undefined) {
      page_nr = this.state.page_nr
    }
  }

  async updateImages(chapter_nr, chapters_arr=this.state.chapters_arr) {
    if(chapter_nr === this.state.chapter_nr+1) {
      const [ req1 ]  = await Promise.all([
        axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr] + '/' + 'pages.json'))
      ]);

      let next_img_arr = getImagesArray(req1.data, chapter_nr=chapter_nr)
      let next_img = next_img_arr[2];

      let img_arr = this.state.next_img_arr;

      img_arr[img_arr.length-1] = {
        source: next_img.source,
        key: img_arr.length-1,
        //chapter_name: chapters_arr[chapter_nr+1],
        chapter_nr: chapter_nr+1,
      }

      img_arr[0] = {
        key: 0,
        source: this.state.img_arr[this.state.img_arr.length].source,
        chapter_nr: chapter_nr-1,
      }

     
      this.setState({
        img_arr: img_arr,
        prev_img_arr: this.state.img_arr,
        next_img_arr: next_img_arr,

        chapter_nr: chapter_nr,
      })

      this.viewPager.scrollToIndex(1,animated=false)

    } else if(chapter_nr === this.state.chapter_nr-1) {

      const [ req1 ]  = await Promise.all([
        axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr] + '/' + 'pages.json'))
      ]);

      
      let prev_img_arr = getImagesArray(req1.data, chapter_nr=chapter_nr, chapter_name=chapters_arr[chapter_nr])
      let prev_img = prev_img_arr[prev_img_arr.length-1]

      let img_arr = this.state.prev_img_arr;
      img_arr[0] = {
        key: 0,
        source: prev_img.source,
        chapter_nr: chapter_nr,
      }

      let next_img = this.state.img_arr[2];
      img_arr[img_arr.length-1] = {
        source: next_img.source,
        key: img_arr.length-1,
        //chapter_name: chapters_arr[chapter_nr+1],
        chapter_nr: chapter_nr+1,
      }

      this.setState({
        img_arr: img_arr,
        next_img_arr: this.state.img_arr,
        prev_img_arr: prev_img_arr,

        chapter_nr: chapter_nr,
      })
      this.viewPager.scrollToIndex(this.state.img_arr.length-1,animated=false)


    } else {
      this.loadImages(chapter_nr=chapter_nr)
    }
  }

 _onPageChange = (pageNumber) => {
    //console.warn(pageNumber)
    if(pageNumber-1 <= 0) {
      this.updateImages(this.state.chapter_nr-1)
      //this.viewPager.scrollToIndex(1, animated=false);
    } else if(pageNumber+1 >= this.state.img_arr) {
      this.updateImages(this.state.chapter_nr+1)
      //this.viewPager.scrollToIndex(1, animated=false);
    } else {
      //this.updateImages(this.state.chapter_nr-1)
      //this.viewPager.scrollToIndex(1, animated=false);
    }
  }


  async loadImages(chapters_arr=this.state.chapters_arr, chapter_nr=this.state.chapter_nr) {
    console.warn('Load Images')
    try {
      const [req1, req2, req3 ] = await Promise.all([
      axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr] + '/' + 'pages.json')),
      axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr-1] + '/' + 'pages.json')),
      axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr+1] + '/' + 'pages.json'))
      ]);

      let img_arr = getImagesArray(req1.data, chapter_nr=chapter_nr, chapter_name=chapters_arr[chapter_nr]);
      let prev_img_arr = getImagesArray(req2.data, chapter_nr=chapter_nr, chapter_name=chapters_arr[chapter_nr-1]);
      let next_img_arr = getImagesArray(req3.data, chapter_nr=chapter_nr, chapter_name=chapters_arr[chapter_nr+1]);

      let prev_img =  prev_img_arr[prev_img_arr.length-2];
      img_arr[0] = {
        source: prev_img.source,
        key: 0,
        //chapter_name: chapters_arr[chapter_nr-1],
        chapter_nr: chapter_nr-1,
      }

      console.warn('prev_img')
      console.warn(prev_img)


      let next_img =  next_img_arr[2]
      img_arr[img_arr.length-1] = {
        source: next_img.source,
        key: img_arr.length-1,
        //chapter_name: chapters_arr[chapter_nr+1],
        chapter_nr: chapter_nr+1,
      }


      this.setState({
        img_arr: img_arr,
        prev_img_arr: prev_img_arr,
        next_img_arr: next_img_arr,
        chapter_name: chapters_arr[chapter_nr],

        pages_data: req1.data,
        pages_data_loaded: true,
      })
    } catch(err){
      console.log(err)
    }
  }


  loadPages(chapters_arr=this.state.chapters_arr, chapter_nr=this.state.chapter_nr) {
    let chapter_name = chapters_arr[chapter_nr]

    //console.warn(encodeURI(ROOT_URL + comic_name + '/' + chapters_arr[chapter_nr] + '/' + (chapter_nr+1) + '.json'))
    {axios.get(encodeURI(ROOT_URL + comic_name + '/' + chapter_name + '/' + 'pages.json'))
          .then(response => {
            let pages_data = response.data

            let img_arr = getImagesArray(pages_data, chapter_name)

            console.warn('img_arr')
            console.warn(img_arr)
            this.setState({
              pages_data: pages_data,
              pages_data_loaded: true,
              img_arr: img_arr,

              chapter_name: chapter_name,
            })
          })
    }
  }

  loadComic(comic_name=this.state.comic_name) {
    {axios.get('https://comic-editor.s3.eu-north-1.amazonaws.com/comics_database3.json')
          .then(response => {
            //let img_arr = getImagesArray(response.data[comic_name][chapter_name]).reverse()

            let chapters_arr = getChapterArray(response.data[comic_name])
            console.warn(chapters_arr)

            //console.warn("Data response: ")
            this.setState({
              comic_data: response.data,
              comic_data_loaded: true,

              chapters_arr: chapters_arr,
            })
            //this.loadPages(chapters_arr)
            this.loadImages(chapters_arr)
          })
    }
  }

  loadDatabase() {
    {axios.get('https://comic-editor.s3.eu-north-1.amazonaws.com/comics_database3.json')
          .then(response => {
            let chapter_arr = getChapterArray(response.data[comic_name])
            //console.warn(chapter_arr)


            //console.warn("Data response: ")
            console.warn(img_arr)
            this.setState({
              data: response.data,
              data_loaded: true,
              chapter_arr: chapter_arr,
              img_arr: img_arr,
            })
          })
    }
  }

  componentDidMount() {
    StatusBar.setHidden(true);
    //if(this.state.data_loaded) {
    //return
    //}

    if(this.state.pages_loaded) this.viewPager.scrollToIndex(this.state.page_nr);
  }

  componentWillUnmount() {
    StatusBar.setHidden(false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextState.data !== this.state.data) {
      return true;
    }
    if(nextState.img_arr !== this.state.img_arr) {
      return true;
    }
    if(nextState.page_nr != this.state.page_nr) {
      this.viewPager.scrollToIndex(nextState.page_nr)
      console.log(this.state.page_nr)
      return false
    }

    
    return true;
  }

   _renderPage = ({data}) => {

    //console.warn(encodeURI(ROOT_URL + this.state.comic_name +'/' + this.state.chapter_name + '/' + data.source))

    return (
      <>

      <View //style={{flex: 1}}
      style={styles.imagebackground}
      {...this._panResponder.panHandlers}>
      
      <Text>{data.key}</Text>
      <ReactNativeZoomableView
      maxZoom={10.0}
      minZoom={1.0}
      zoomStep={0.5}
      initialZoom={1}
      bindToBorders={false}
      onZoomAfter={this.logOutZoomState}
      style={{
        padding: 10,
        backgroundColor: 'red',
      }}
      >



      { data.source ? <Image
                        key={'im' + data.key}
                        source={{uri: encodeURI(ROOT_URL + this.state.comic_name +'/' + this.state.chapters_arr[data.chapter_nr] + '/' + data.source)}}
                        //source={{uri: encodeURI(ROOT_URL + this.state.comic_name +'/' + data.chapter_name + '/' + data.source)}}
                        //source={{uri: encodeURI(ROOT_URL + this.state.comic_name +'/' + this.state.chapter_name + '/' + '007.png')}}
                        style={styles.imagebackground} /> : <View style={styles.noImage}/>}

          </ReactNativeZoomableView>

      </View>
      </>
    )
  }

  render() {
    //const MainNavigator = mainNavigator(this.state);
    //    const { navigation } = this.props;
    console.log(this.state.page_nr)

    //if(this.state.pages_data_loaded === false) {
      //return (<Text>Pages Data not loaded</Text>)
    //}

    if(this.state.img_arr.length === 0) {
      return (<Text>Image Data not loaded</Text>)
    }

    if(this.state.prev_img_arr.length === 0) {
      return (<Text>Prev Image Data not loaded</Text>)
      }
    return (
      <View style={styles.container} >
      <ViewPager
      ref={ref => {this.viewPager = ref}}
      //firePageChangeIfPassedScreenCenter={true}
      //data={data}
      data={this.state.img_arr}
      renderPage={this._renderPage}
      onPageChange={this._onPageChange}
      />

      </View>
    )

    return (
      <ViewPager
        dev={true}
        ref={ref => {this.viewPager = ref}}
        data={this.state.img_arr}
        renderPage={this._renderPage}
      //            initialPage={this.state.img_arr[this.state.img_arr.length-1]}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  imagebackground: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'salmon',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3, 
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F04812',
  }

})


//<MainNavigator/>
//const mainNavigator = value => createBottomTabNavigator({
//const MainNavigator = createBottomTabNavigator({
const MainNavigator = createDrawerNavigator({
  //Home: { screen : props => <Home {...props} {...value} /> },
  Home: { screen : App },
  Settings: {
    screen: Settings,
  },
});

//export default App;
export default MainNavigator;
