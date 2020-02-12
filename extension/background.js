let proxyList = [];

let domain_list = [] ;
let update_list = [] ;

let current_domain = "" ;

function save(proxy)
{
  proxyList.push(proxy);
  chrome.storage.local.set({proxy_list: proxyList}, function()
  {
      console.log("save_proxy_done");
  });
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  if(request.msg == "add_proxy")
  {
    console.log("add_proxy_requested");
    
    var str = '{"country": " ", "response_time": 0, "host": "' + request.data.ip + '", "port": ' + request.data.port + ', "anonymity": " ", "type": " "}' ;
    var cmp = '"country":" ","response_time":0,"host":"' + request.data.ip +'","port":' + request.data.port +',"anonymity":" ","type":" "';
    var tmpa = JSON.stringify(proxyList);
    var tmpb = JSON.stringify(update_list);

    if(tmpa.includes(cmp) || tmpb.includes(cmp))
      console.log("proxy_already_exist");
    else
      save(JSON.parse(str));

    chrome.storage.local.get('proxy_list', function(get)
    {
        console.log(get.proxy_list);
    });
  }
  else if(request.msg == "set_proxy")
  {
    console.log("set_proxy_requested");
    var toset_ip = request.data.ip ;
    var toset_port = parseInt(request.data.port) ;
    const config =
    {
      mode: 'fixed_servers' ,
      rules:
      {
        singleProxy:
        {
          host: toset_ip ,
          port: toset_port ,
        } ,
      } ,
    } ;
    chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {}) ;
    chrome.runtime.sendMessage(
    {
      msg: "set_proxy_ok", 
      data:
      {
        ip: toset_ip,
        port: toset_port,
      }
    });
    console.log("set_proxy_done");
  } 
  else if(request.msg == "add_domain")
  {
    console.log("add_domain_requested");
    var domain_set = 
    {
      ip: request.data.ip,
      port: request.data.port,
      domain: request.data.domain
    }
    domain_set = JSON.stringify(domain_set) ;
    domain_list.push(domain_set) ;
    console.log(domain_set) ;
    chrome.storage.local.set({local_domain_list: domain_list}, function()
    {
        console.log("save_domain_done");
    });
    /*
    chrome.storage.local.get('local_domain_list', function(get)
    {
        console.log("flag");
        console.log(get.local_domain_list);
    });
    */
    console.log("add_domain_done");
  } 
  else if(request.msg == "request_update")
  {
    console.log("update_requested");
    var req = new XMLHttpRequest() ;
    req.open("GET", "https://raw.githubusercontent.com/w4a2y4/2019CNlab/master/final/proxyList/proxy.list?token=AFKGNGQTFOK7NOUBK7SVJLK5CLXTG") ;
    req.send(null) ;
    req.onreadystatechange = function()
    {
      if (req.readyState == XMLHttpRequest.DONE)
      {
        const update_from_url = req.responseText ;
        update_list = update_from_url.split('\n') ;
        for(var i = 0 ; i < update_list.length ; i++)
          update_list[i] = JSON.parse(update_list[i]) ;
        //console.log(update_list) ;
        var updated_sample_list = proxyList.concat(update_list[0], update_list[1], update_list[15], update_list[16], update_list[30], update_list[31], update_list[36], update_list[51], update_list[66], update_list[81]) ;
        console.log(updated_sample_list) ;
        chrome.runtime.sendMessage(
        {
          msg: "update_proxy_list", 
          data:
          {
            list: updated_sample_list,
          }
        });
        console.log("update_done") ;
      }
    }
  }
  else if(request.msg == "reset_proxy")
  {
    console.log("resey_proxy_requested");
    chrome.proxy.settings.set({value: { mode: 'system' }, scope: 'regular'}, function() {}) ;
    console.log("reset_proxy_done");
  }
    
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
  if(changeInfo.status == "loading")
  {
    var tab_url = new URL(tab.url) ;
    if(current_domain != tab_url.hostname)
    {
      current_domain = tab_url.hostname ;
      chrome.storage.local.get('local_domain_list', function(get)
      {
          for(var i = 0 ; i < get.local_domain_list.length ; i++)
          {
            var find = JSON.parse(get.local_domain_list[i]) ;
            if(find.domain == current_domain)
            {
              console.log("set_proxy_requested_domain");
              var toset_ip = find.ip ;
              var toset_port = parseInt(find.port) ;
              const config =
              {
                mode: 'fixed_servers' ,
                rules:
                {
                  singleProxy:
                  {
                    host: toset_ip ,
                    port: toset_port ,
                  } ,
                } ,
              } ;
              chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {}) ;
              chrome.runtime.sendMessage(
              {
                msg: "set_proxy_ok", 
                data:
                {
                  ip: toset_ip,
                  port: toset_port,
                }
              });
              console.log("set_proxy_done_domain");
              break ;
            }
          }
      });
      console.log(current_domain) ;
    }
  }
});