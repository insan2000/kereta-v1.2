// Toggle satuan
// Fungsi toggle per ID
function toggleById(id, btn) {
  const el = document.getElementById(id);
  el.classList.toggle("show");
  btn.classList.toggle("open");
}

// Toggle semua
function toggleAll() {
  const ids = ["hidethis1", "hidethis2", "hidethis3", "hidethis4", "hidethis5", "hidethis6", "hidethis7", "hidethis8", "hidethis9", "hidethis10", "hidethis11", "hidethis12", "hidethis13", "hidethis14", "hidethis15", "hidethis16", "hidethis17", "hidethis18", "hidethis19", "hidethis20", "hidethis21", "hidethis22"];
  const buttons = document.querySelectorAll(".toggle-btn");
  const anyHidden = ids.some(id => !document.getElementById(id).classList.contains("show"));
  
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (anyHidden) {
      el.classList.add("show");
    } else {
      el.classList.remove("show");
    }
  });
  
  buttons.forEach(btn => {
    if (anyHidden) {
      btn.classList.add("open");
    } else {
      btn.classList.remove("open");
    }
  });
  
  document.getElementById("toggleAllBtn").innerText = anyHidden ? "Sembunyikan Semua Jadwal" : "Tampilkan Semua Jadwal";
}

// create the sidebar instance and add it to the map
var sidebar = L.control.sidebar({ 
    container: 'sidebar'
}).addTo(map);

//Move Layers control to sidebar
var layerControlContainer = layerControl.getContainer();
$("#layercontrol").append(layerControlContainer);
$(".leaflet-control-layers-list").prepend("<strong class='title'>Base Maps</strong><br>");
$(".leaflet-control-layers-separator").after("<br><strong class='title'>Layers</strong><br>");

// add panels dynamically to the sidebar
sidebar
    .addPanel({
        id:   'js-api',
        tab:  '<i class="fa fa-gear"></i>',
        title: 'JS API',
        pane: '<p>The Javascript API allows to dynamically create or modify the panel state.<p/><p><button onclick="sidebar.enablePanel(\'mail\')">enable mails panel</button><button onclick="sidebar.disablePanel(\'mail\')">disable mails panel</button></p><p><button onclick="addUser()">add user</button></b>',
    })
    // add a tab with a click callback, initially disabled
    .addPanel({
        id:   'mail',
        tab:  '<i class="fa fa-envelope"></i>',
        title: 'Messages',
        button: function() { alert('opened via JS callback') },
        disabled: true,
    })

// be notified when a panel is opened
sidebar.on('content', function (ev) {
    switch (ev.id) {
        case 'autopan':
        sidebar.options.autopan = true;
        break;
        default:
        sidebar.options.autopan = false;
    }
});

var userid = 0
function addUser() {
    sidebar.addPanel({
        id:   'user' + userid++,
        tab:  '<i class="fa fa-user"></i>',
        title: 'User Profile ' + userid,
        pane: '<p>user ipsum dolor sit amet</p>',
    });
}