const baseURL = 'http://127.0.0.1:5001';

export function request(params){
  
  let dataObj = params.data || {};
  let headerObj = {			
    'content-type': 'application/json'    
  }
  
  return new Promise((resolve,reject)=>{
    console.log(dataObj);
    wx.request({
      url: baseURL + params.url,
      method:params.method || "GET",
      data:dataObj,
      header:headerObj,
      success:res=>{
        if(res.data.code!=0){
          reject(res.data);
          return;
        }
        resolve(res.data)
      },
      fail:err=>{
        reject(err)
      }
    })
  })
}