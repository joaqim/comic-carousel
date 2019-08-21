import React, { useEffect, useState} from 'react';
import { Text, StyleSheet } from 'react-native';

import ViewPager from 'react-native-viewpager-carousel';

const comic_name = "One+Piece+-+Digital+Colored+Comics"

const chapter_name = " /Vol.28+Ch.0263+-+Pirate+Nami+and+the+Sky+Knight+vs.+Vice+Captains+Hotori+and+Kotori+(gb)+%5BPowerManga%5D/"

function.prototype.pad = function(size=3) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

let ComicViewer = () => {
  const [pages, setPages] = useState([]);
  const [pages_loaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages(chapter_nr) {
    const api_root = "https://comic-editor.s3.eu-north-1.amazonaws.com"
    const accessKey = ""


    axios.get('${apiRoot}/${comic_name}/${2.pad()}.json')
         .then(res => {
           setPages([...pages, ...res.data])
           setIsLoaded(true)
         });

  }

  return (
    <Text>
      ComicViewer
    </Text>
  )
}

export default ComicViewer;
