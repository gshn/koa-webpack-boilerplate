/**
 * 예제  모듈
 *
 * @module src/client/modules/example
 */
import axios from 'axios'

const example = async () => {
  let res
  try {
    res = await axios({
      method: 'get',
      url: '/',
    })
  } catch (err) {
    console.log(err)
    return false
  }

  return res.data
}

export default example
