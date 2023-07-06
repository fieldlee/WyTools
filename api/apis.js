import {request} from "../utils/request"

//计算按长度计算1d
export function stock1DbyLen(data){
  return request({
    url:"/stocks_1d_by_len",
    method:"POST",
    data
  })
}
//计算按重量计算1d
export function stock1DByWeight(data){
  return request({
    url:"/stocks_1d_by_weight",
    method:"POST",
    data
  })
}
//计算按长度计算2d
export function stock2DByArea(data){
  return request({
    url:"/stocks_2d_by_area",
    method:"POST",
    data
  })
}
//计算按重量计算2d
export function stock2DByWeight(data){
  return request({
    url:"/stocks_2d_by_weight",
    method:"POST",
    data
  })
}