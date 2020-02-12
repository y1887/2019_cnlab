function update_proxy_list(list) {
  //TODO: update UI by recved list
  for (var i = 0; i < list.length; i++) {
    prox = list[i];
    tr = $('#proxy_list tbody').find('.list_item')[i];
    $($(tr).find('.country_item')[0]).text(prox['country']);
    $($(tr).find('.ip_item')[0]).text(prox['host']);
    $($(tr).find('.port_item')[0]).text(prox['port']);
  }
}

// p = [{"country": "AA", "ip": "12.34.56.78", "port": "8080"}, {"country": "BB", "ip": "22.33.55.77", "port": "6666"}]

function set_proxy_ok(ip, port) {
  //TODO: update the corresponding UI as "already set"
  $('tr').find('button').text("SET");
  trs = $('#proxy_list tbody').find('.list_item');
  for (var i = 0; i < trs.length; i++) {
    tr = trs[i];
    trip = $($(tr).find('.ip_item')[0]).text();
    trport = $($(tr).find('.port_item')[0]).text();
    if( ip == trip && port == trport ) {
      $($(tr).find('button')[0]).text("OK");
      break;
    }
  }
}

function add_proxy(ip, port, domain) {
  console.log("add proxy: " + ip + ":" + port + " " + domain);
  chrome.runtime.sendMessage({
      msg: "add_proxy", 
      data: {
          ip: ip,
          port: port
      }
  });
  set_proxy(ip, port, domain)
}

function set_proxy(ip, port, domain) {
  console.log("set proxy: " + ip + ":" + port + " " + domain);
  chrome.runtime.sendMessage({
      msg: "set_proxy", 
      data: {
          ip: ip,
          port: port
      }
  });
  add_domian(ip, port, domain);
}

function reset_proxy() {
  chrome.runtime.sendMessage({
    msg: "reset_proxy"
  });
  $('tr').find('button').text("SET");
}

function add_domian(ip, port, domain) {
  if (domain != null) {
    console.log("add domain: " + ip + ":" + port + " " + domain);
    chrome.runtime.sendMessage({
      msg: "add_domain", 
      data: {
        ip: ip,
        port: port,
        domain: domain
      }
    });
  }
}

function request_update() {
  console.log("request update")
  chrome.runtime.sendMessage({
    msg: "request_update", 
    data: {}
  });
}

function check_domain() {
  if ( $('#domain_check').is(":checked") ) {
    return $('#domain_box').val();
  } else return null;
}

$(document).ready(function() {

  $(".add_btn").click(function(){
    console.log("add clicked");
    var ip = $('#custom_ip').val();
    var port = $('#custom_port').val();
    add_proxy(ip, port, check_domain());
    request_update();
  });

  $(".set_btn").click(function(){
    console.log("set clicked");
    var ip = $(this).parent().parent().find('.ip_item')[0].innerHTML;
    var port = $(this).parent().parent().find('.port_item')[0].innerHTML;
    set_proxy(ip, port, check_domain());
  });

  $(".update_btn").click(function(){
    console.log("update clicked");
    request_update();
  });

  $(".reset_btn").click(function(){
    console.log("reset clicked");
    reset_proxy();
  });

});


document.addEventListener('DOMContentLoaded', () => {
  // initialize proxy list
  // request_update();
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request);
      if (request.msg === "update_proxy_list") {
        console.log(request.data.list);
        update_proxy_list(request.data.list);
      }
      else if (request.msg === "set_proxy_ok") {
        set_proxy_ok(request.data.ip, request.data.port)
      }
    }
  );
});