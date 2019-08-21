

export async function getComicDatabaseAsync() {
	try {
		let response = await fetch('https://comic-editor.s3.eu-north-1.amazonaws.com/comics_database.json');
		let responseJson = await response.json();
		return responseJson
	} catch (error) {
		console.error(error)
	}
}

export function getComicDatabase() {
	return fetch('https://comic-editor.s3.eu-north-1.amazonaws.com/comics_database.json')
		.then(response => {
			return response.json()
		})
		.catch(error => {
			console.error(error)
		});
}


 export function getValueByKey(comic_data, value) {
    /*
    for (var i = 0; i < comic_data.length; i++) {
      if (comic_data[i].key === value) {
        return comic_data[i];
      }
    }
    return null;
    */
    //return comic_data.find(chapter => chapter.key == value)
    return comic_data.filter(chapter => chapter.key == value)
  }

export function getChapterArray(comic_data, hq=false) {
  let chapters = [];
  Object.keys(comic_data).forEach(function(index) {
    chapters[parseInt(index-1, 10)] = comic_data[index]
  })
  return chapters;
}
 
export function getImagesArray(pages_data, chapter_nr, chapter_name, hq=false) {
  let images = [];
  console.warn('pages_data')
  console.warn(pages_data)

  images[0] = {key: 0, source: null}


  Object.keys(pages_data).forEach(function(page_nr) {
    Object.keys(pages_data[page_nr]).forEach(function(key) {
      page_nr = parseInt(page_nr, 10)
      if (key == 's') {
        images[page_nr+1] = {
          key: page_nr+1,
          chapter_nr: chapter_nr,
          chapter_name: chapter_name,
          source: pages_data[page_nr]['s'],
        }
      }

      /*
      if(hq && key == 'sq') {
        images[page_nr] = {
          key: page_nr,
          index: page_nr,
          source: pages_data[page_nr]['sq']
        }
      } else
      if(key == 's') {
        images[page_nr] = {
          key: page_nr,
          index: page_nr,
          source: pages_data[page_nr]['s'],
          source_hq: pages_data[page_nr]['sq']
        }
      }
      */

    });
  });

  images[images.length] = {key: images.length, source: null}
  return images;
}
