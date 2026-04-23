import Axios, { CreateAxiosDefaults }  from "axios";

/**
 * @example
 * import request from "./"
 * 
 * function getList(): Promise<any> {
 *  return request({
 *    url: "/list",
 *  })
 * }
 * 
 * 
 */
export default function (config: CreateAxiosDefaults) {
  const instance = Axios.create(config)

  instance.interceptors.request.use((config) => {
    // console.log("request", config)
    return config
  })
  
  instance.interceptors.response.use((response) => {
    // console.log("response", response)
    return response
  })
  return instance
}

