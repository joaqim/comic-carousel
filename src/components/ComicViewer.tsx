import React, { useEffect, useState} from 'react';
import { Text, View, Image, ImageBackground, StyleSheet } from 'react-native';

import { ViewPager } from 'react-native-viewpager-carousel'
import axios from 'axios';

interface Number {
  //pad: (size : number) => string;
  pad: () => string;
  str: () => string;
}

function pad(val : number) {
  var s = String(val)
  const size = 3;
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

Number.prototype.pad = function() : string {
  var s = String(this);
  const size = 3;
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

Number.prototype.str = function() : string {
  return String(this)
}

let ComicViewer = () => {
  const api_root = "https://comic-editor.s3.eu-north-1.amazonaws.com"
  const comic_name = "One Piece - Digital Colored Comics"

  const [loaded, setIsLoaded] = useState(false);
  const [comicData, setComicData] = useState([]);
  const [pagesData, setPagesData] = useState([]);

  const [page_count, setPageCount] = useState(0);
  const [chapter_number, setChapter] = useState(7);

  const [pages, setPages] = useState([]);
  const [page_source_arr, setPageSourceArr] = useState([]);

  const [initialIndex, setInitialIndex] = useState(1);
  const [startAtHead, setStartAtHead] = useState(true);

  useEffect(() => {
    if(loaded) {
      //setPages(loadPages(comicData, chapter_number))
    } else {
      fetchComicData()
    }
  })

  const fetchComicData = () => {
    if(loaded) return;
    axios.get(encodeURI(`${api_root}/${comic_name}/comic.json`))
         .then(res => {
           //if(res.data !== comicData)
           {
             //console.warn(`Data loaded: ${res.data}`)
             setComicData(res.data)

             setPages(loadPages(res.data, chapter_number))
             setIsLoaded(true)
           }
         });
  }

  const shiftPages = (forward: boolean = true) => {
    if (forward) {
      source_arr[0] = {
        key: 0,
        name: source_arr[source_arr.length-2].name,
        source_index: 0,
      }
      source_arr[1] = {
        key: 1
        name: source_arr[source_arr.length].name,
        source_index: 1
      }
    }
  }

  const loadChapter = (data, source_arr, count_arr,chapter, chapter_index) => {
    chapter = data[comic_name][chapter[0]]
    Object.keys(chapter).forEach(function(key) {
          switch(key) {
            case "t" : {
              var chapter_name : String = chapter['t'];
              source_arr[chapter_index] = `${comic_name}/${chapter_name}`;
              break;
            }
            case "c" : {
              count_arr[chapter_index] = parseInt(chapter['c'], 10);
              break;
            }
            case "h" : {
              //hq = (chapter['h'] === 'true')
              //hq = chapter['h'];
              break;
            }
          }
    });
  }

  const loadPages = (data, chapter_nr : Number) => {
    //console.warn('loadPages')
    var source_arr = new Array(3)
    var count_arr = new Array(3)
    var page_count : number = 0;

    //console.warn(data[comic_name])
    Object.entries(data[comic_name]).slice(chapter_nr-2, chapter_nr+1).forEach(
      function(chapter, chapter_index) {
        loadChapter(data, source_arr, count_arr,chapter, chapter_index)
      });

    var pages_data = new Array(count_arr[1]-1)
    pages_data[0] = {key: 0, name: `${pad(count_arr[0])}.png`, source_index: 0}
    var i: Number = 1;
    for(i;i < count_arr[1];i++) {
      pages_data[i] = {
        key: i,
        //source: encodeURI(`${source_arr[1]}/${i.pad()}.png`),
        name: `${i.pad()}.png`,
        source_index: 1,
      }
    }

    pages_data.push({key: i, name: `${pad(1)}.png`, source_index: 2})
    setPageSourceArr(source_arr)
    //console.warn(pages_data)
    return pages_data;
  }

  const renderPage = ({data}) => {
    return (
      <>
        <Text>
          {data.key}
          {data.name}
        </Text>
        <ImageBackground source={{uri: `${api_root}/${page_source_arr[data.source_index]}/${data.name}`}} style={styles.imagebackground} />
      </>
    )
  }

  const _onPageChange = (pageNumber) => {
    console.warn(pageNumber)
    if(loaded && pageNumber === 0) {
      //console.warn("Prev Chapter")
      //setIsLoaded(false)
      //setChapter(chapter_number-1)
      //setPages(loadPages(comicData, chapter_number-1))
      //setStartAtHead(false)
    } else if (loaded && pageNumber == pages.length) {
      //console.warn("Next Chapter")
      setIsLoaded(false)
      setChapter(chapter_number+1)
      setPages(loadPages(comicData, chapter_number+1))
      setStartAtHead(true)
    }
  }


  return (
    <View style={styles.container}>
    {loaded ?
     <ViewPager
      ref={ref => {this.viewPager = ref}}
      data={pages}
      initialPage={startAtHead ? pages[1] : pages[pages.length-2]}
      renderPage={renderPage}
      onPageChange={_onPageChange.bind(this)}
      />
      : <Text>Loading comic</Text>}
    </View>
  )

  return (
    loaded ?
    <Text></Text>
    : <Text>Comic not Loaded</Text>
  )

  
}


let ComicViewerOld = () => {
  const api_root = "https://comic-editor.s3.eu-north-1.amazonaws.com"
  const comic_name = "One Piece - Digital Colored Comics"

  //const chapter_name = " Vol.28+Ch.0263+-+Pirate+Nami+and+the+Sky+Knight+vs.+Vice+Captains+Hotori+and+Kotori+(gb)+%5BPowerManga%5D"


  const [pages, setPages] = useState([]);
  const [comic_data, setComicData] = useState();
  const [img_arr, setImages] = useState([]);
  const [loaded, setIsLoaded] = useState(false);
  const [page_source, setPageSource] = useState();
  const [page_source_arr, setPageSourceArr] = useState();
  const [page_count, setPageCount] = useState(0);
  const [chapter_number, setChapter] = useState(308);

  useEffect(() => {
    if(loaded) {
      setPages(loadPages(comic_data, chapter_number))
    } else {
      fetchPages(chapter_number);
    }

  }, []);

  const loadPages = (data, chapter_nr : Number) => {
    console.warn(loadPages)
    var source_arr = new Array(3)
    var count_arr = new Array(3)
    var hq_arr : boolean[] = false
    var page_count : number = 0;

    //Object.keys(data[comic_name][chapter_nr.str()]).forEach(function() {
    //Object.keys(data[comic_name]).slice(chapter_nr-1,chapter_nr+1).map(key => ({[key]:data[comic_name][key]})).forEach(function() {
    //console.warn(Array.prototype.slice.call(data[comic_name], 308, 310))
    //Array.prototype.slice.call(data[comic_name], chapter_nr-1, chapter_nr+1).map((chapter_key) => { //(chapter_key) => //.forEach(function() {

    //console.warn(Object.entries(data[comic_name]).slice(chapter_nr-2, chapter_nr+1))
    Object.entries(data[comic_name]).slice(chapter_nr-2, chapter_nr+1).forEach(function(chapter, chapter_index) {
      chapter = data[comic_name][chapter[0]]
      //console.warn(chapter)
      Object.keys(chapter).forEach(function(key) {
        switch(key) {
          case "t" : {
            var chapter_name : String = chapter['t'];
            source_arr[chapter_index] = `${comic_name}/${chapter_name}`;
            break;
          }
          case "c" : {
            count_arr[chapter_index] = parseInt(chapter['c'], 10);
            break;
          }
          case "h" : {
            //hq = (chapter['h'] === 'true')
            //hq = chapter['h'];
            break;
          }
        }
      });


    });

    var pages_data = new Array(count_arr[1]-1)
    //pages_data[0] = {key: 0, source: `${source_arr[0]}/${pad(count_arr[0])}.png`}
    pages_data[0] = {key: 0, name: `${pad(count_arr[0])}.png`, source_index: 0}
    var i: Number = 1;
    for(i;i < count_arr[1];i++) {
      //pages_data.push({
      pages_data[i] = {
        key: i,
        //source: encodeURI(`${source_arr[1]}/${i.pad()}.png`),
        name: `${i.pad()}.png`,
        source_index: 1,
      }
    }

    //pages_data.push({key: i, source: `${source_arr[2]}/${pad(1)}.png`})
    pages_data.push({key: i, name: `${pad(1)}.png`, source_index: 2})
    setPageSourceArr(source_arr)

    //setIsLoaded(true)
    console.warn(pages_data)
    return pages_data;
  }


  const fetchComicsDatabase = () => {

    axios.get(encodeURI(`${api_root}/${comic_name}/comic.json`))
         .then(res => {
           setData(res.data)
           setDataLoaded(true)
         });
  }
  const fetchPages = (chapter_nr: Number) => {
    //const accessKey = ""

    var n: Number = 2;
    console.assert(n.pad() === '002')
    //axios.get(`${api_root}/${comic_name}/${chapter_name}/${chapter_nr.pad()}.json`)
    //axios.get(`${api_root}/${comic_name}/comics_database4.json`)
    //console.warn(`${api_root}/${comic_name}/comic.json`)
    axios.get(encodeURI(`${api_root}/${comic_name}/comic.json`))
           .then(res => {
             //setPages([...pages, ...res.data])
             //setImages([...img_arr, ...images])


             setPages(loadPages(res.data, chapter_nr))

             //setPageSource(encodeURI(source))
             //setPageCount(count)
             setComicData(res.data)
             setIsLoaded(true)
           });
  }

  /*
     {...this._panResponder.panHandlers}>
   */
  const renderPage = ({data}) => {
    return (
      <>
        <Text>
          {data.key}
          {data.name}
        </Text>
        <ImageBackground source={{uri: `${api_root}/${page_source_arr[data.source_index]}/${data.name}`}} style={styles.imagebackground} />
      </>
    )

    return (
      <>
        <View
          style={styles.imagebackground}
        >
          <Text>
            {data.source}
          </Text>
          <ImageBackground source={{uri: `${api_root}/${data.source}`}} style={styles.imagebackground} />
        </View>
      </>
    )
  }

  const _onPageChange = (pageNumber) => {
    //console.warn(pageNumber)
    if(loaded && pageNumber === 1) {
      //setIsLoaded(false)
      setChapter(chapter_number-1)
      setPages(loadPages(comic_data, chapter_number-1))
    } else if (loaded && pageNumber == pages.length) {

      //setIsLoaded(false)
      setChapter(chapter_number+1)
      setPages(loadPages(comic_data, chapter_number+1))
    }
  }


  data = [
    { key: 0, source_index: 0, name: '020.png' },
    { key: 1, source_index: 1, name: '001.png' },
    { key: 2, source_index: 2, name: '002.png' },
  ]
  console.log(pages)

  return (
    <View style={styles.container}>
      {loaded ?
       <ViewPager
         ref={ref => {this.viewPager = ref}}
         data={pages}
       //data={data}
       //initialPage={data[1]}
         initialPage={pages[1]}
         renderPage={renderPage}
         onPageChange={_onPageChange.bind(this)}
       />
      : <Text>Loading comic</Text>}

      {loaded && false ?
       <>
         <ImageBackground style={styles.imagebackground} source={{uri: `${api_root}/${page_source}/007.png`}} />
       </>
      : <Text>Comic not loaded</Text>}
    </View>
  )
}


/*

   <Text> {`${api_root}/${page_source}/007.png`} </Text>
   <ImageBackground style={styles.imagebackground} source={{uri: `${api_root}/${page_source}/007.png`}} />
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  imagebackground: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})

export default ComicViewer;
